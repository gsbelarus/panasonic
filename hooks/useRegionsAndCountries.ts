import { useState, useEffect, useCallback } from 'react';
import type { RegionResponse, CountryResponse } from '@/lib/db/schemas';

// ============================================================================
// Types
// ============================================================================

interface UseRegionsResult {
  regions: RegionResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCountriesResult {
  countries: CountryResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCountriesByRegionResult {
  countries: CountryResponse[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all regions
 */
export function useRegions(): UseRegionsResult {
  const [regions, setRegions] = useState<RegionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/regions');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch regions');
      }

      setRegions(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch regions';
      setError(message);
      console.error('[useRegions] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, loading, error, refetch: fetchRegions };
}

/**
 * Hook to fetch all countries
 */
export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/countries');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch countries');
      }

      setCountries(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch countries';
      setError(message);
      console.error('[useCountries] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return { countries, loading, error, refetch: fetchCountries };
}

/**
 * Hook to fetch countries filtered by region code
 */
export function useCountriesByRegion(regionCode: string | null): UseCountriesByRegionResult {
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regionCode) {
      setCountries([]);
      return;
    }

    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/countries?regionCode=${encodeURIComponent(regionCode)}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch countries');
        }

        setCountries(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch countries';
        setError(message);
        console.error('[useCountriesByRegion] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [regionCode]);

  return { countries, loading, error };
}
