'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoreCard from '@/components/StoreCard';
import { CustomSelect } from '@/components/filters';
import { useRegions, useCountriesByRegion } from '@/hooks/useRegionsAndCountries';
import type { StoreResponse } from '@/lib/db/schemas';
import type { MapMarker } from '@/components/LeafletMap';

// Dynamically import LeafletMap to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-[var(--muted)]">Loading map...</div>
    </div>
  ),
});

// ============================================================================
// Select Option Type
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

// ============================================================================
// Toggle Switch Component
// ============================================================================

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ label, checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className="text-sm text-[var(--foreground)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-gray-300'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </label>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function WhereToBuyPage() {
  // Region and country state
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Stores state
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const storesRequestIdRef = useRef(0);

  // Selected store for map/card sync
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Sort by nearest state
  const [sortByNearest, setSortByNearest] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch regions and countries
  const { regions, loading: regionsLoading } = useRegions();
  const { countries, loading: countriesLoading } = useCountriesByRegion(selectedRegion || null);

  // Convert to select options
  const regionOptions: SelectOption[] = useMemo(
    () => regions.map((r) => ({ value: r.code, label: r.name })),
    [regions]
  );

  const countryOptions: SelectOption[] = useMemo(
    () => countries.map((c) => ({ value: c.iso2, label: c.name })),
    [countries]
  );

  // Convert stores to map markers
  const mapMarkers: MapMarker[] = useMemo(
    () =>
      stores.map((store) => ({
        id: store._id,
        lat: store.location.lat,
        lng: store.location.lng,
        name: store.name,
      })),
    [stores]
  );

  // Handle region change
  const handleRegionChange = useCallback((value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setStores([]);
    setSelectedStoreId(null);
    setSortByNearest(false);
    setUserLocation(null);
    setLocationError(null);
  }, []);

  // Handle country change
  const handleCountryChange = useCallback((value: string) => {
    setSelectedCountry(value);
    setStores([]);
    setSelectedStoreId(null);
    setSortByNearest(false);
    setUserLocation(null);
    setLocationError(null);
  }, []);

  // Fetch stores
  const fetchStores = useCallback(
    async (sortNearest = false, lat?: number, lng?: number) => {
      if (!selectedRegion || !selectedCountry) return;

      const requestId = ++storesRequestIdRef.current;

      setStoresLoading(true);
      setStoresError(null);

      try {
        let url = `/api/stores?regionCode=${encodeURIComponent(
          selectedRegion
        )}&countryIso2=${encodeURIComponent(selectedCountry)}`;

        if (sortNearest && lat !== undefined && lng !== undefined) {
          url += `&sort=nearest&lat=${lat}&lng=${lng}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch stores');
        }

        if (requestId !== storesRequestIdRef.current) {
          return;
        }

        setStores(data.data);
        setSelectedStoreId(null);
      } catch (err) {
        if (requestId !== storesRequestIdRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Failed to fetch stores';
        setStoresError(message);
        console.error('[WhereToBuy] Error fetching stores:', err);
      } finally {
        if (requestId !== storesRequestIdRef.current) {
          return;
        }
        setStoresLoading(false);
      }
    },
    [selectedRegion, selectedCountry]
  );

  // Handle Find Stores button click
  const handleFindStores = useCallback(() => {
    fetchStores(false);
  }, [fetchStores]);

  // Handle sort by nearest toggle
  const handleSortByNearestChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Request geolocation
        if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by your browser');
          setSortByNearest(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setLocationError(null);
            setSortByNearest(true);
          },
          (error) => {
            let message = 'Unable to get your location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location access denied. Please enable location permissions.';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable.';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out.';
                break;
            }
            setLocationError(message);
            setSortByNearest(false);
          }
        );
      } else {
        setSortByNearest(false);
        setUserLocation(null);
        setLocationError(null);
        // Refetch with default sorting
        fetchStores(false);
      }
    },
    [fetchStores]
  );

  // Handle marker click
  const handleMarkerClick = useCallback((id: string) => {
    setSelectedStoreId(id);
  }, []);

  // Handle store card click
  const handleStoreCardClick = useCallback((id: string) => {
    setSelectedStoreId(id);
  }, []);

  // Re-fetch with sort when userLocation changes while sortByNearest is true
  useEffect(() => {
    if (sortByNearest && userLocation && stores.length > 0) {
      fetchStores(true, userLocation.lat, userLocation.lng);
    }
    // Only depend on sortByNearest and userLocation, not stores to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByNearest, userLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          {/* Title and Intro */}
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">Where to buy</h1>
          <p className="text-[var(--muted)] mb-2">
            Discover our products at your nearest stores. Select your region and city to get started.
          </p>
          <p className="text-[var(--muted)] mb-2">
            For the most accurate information, please contact the store directly.
          </p>
          <p className="text-[var(--muted)] mb-6">
            In case of any questions please{' '}
            <a href="#" className="text-blue-600 hover:underline">
              contact us
            </a>
          </p>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <CustomSelect
              label="Region"
              options={regionOptions}
              value={selectedRegion}
              onChange={handleRegionChange}
              placeholder="Select region..."
              loading={regionsLoading}
              wrapperClassName="flex-1"
              overlayZIndexClass="z-[1001]"
              menuZIndexClass="z-[1002]"
            />
            <CustomSelect
              label="Country"
              options={countryOptions}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Select country..."
              loading={countriesLoading}
              disabled={!selectedRegion}
              wrapperClassName="flex-1"
              overlayZIndexClass="z-[1001]"
              menuZIndexClass="z-[1002]"
            />
            <div className="flex items-end">
              <button
                type="button"
                className="px-6 py-2.5 bg-[var(--error)] hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFindStores}
                disabled={!selectedRegion || !selectedCountry || storesLoading}
              >
                {storesLoading ? 'Loading...' : 'Find stores'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {storesError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {storesError}
            </div>
          )}

          {/* Content Area - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Map */}
            <div className="h-[500px] rounded-lg overflow-hidden border border-[var(--border)]">
              <LeafletMap
                markers={mapMarkers}
                selectedMarkerId={selectedStoreId}
                onMarkerClick={handleMarkerClick}
                className="h-full"
              />
            </div>

            {/* Right Column - Store List */}
            <div className="flex flex-col">
              {/* Sort by nearest toggle */}
              <div className="flex items-center justify-end mb-4">
                <ToggleSwitch
                  label="Sort by nearest"
                  checked={sortByNearest}
                  onChange={handleSortByNearestChange}
                  disabled={stores.length === 0}
                />
              </div>

              {/* Location error message */}
              {locationError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  {locationError}
                </div>
              )}

              {/* Store Cards */}
              <div className="flex-1 overflow-y-auto max-h-[440px] space-y-4 pr-2">
                {stores.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[var(--muted)]">
                    {selectedRegion && selectedCountry
                      ? 'No stores found. Click "Find stores" to search.'
                      : 'Select a region and country, then click "Find stores"'}
                  </div>
                ) : (
                  stores.map((store) => (
                    <StoreCard
                      key={store._id}
                      store={store}
                      isSelected={store._id === selectedStoreId}
                      onClick={() => handleStoreCardClick(store._id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
