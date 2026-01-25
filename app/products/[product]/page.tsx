'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { ProductResponse, ProductMarketSpec, ProductPQSeries } from '@/lib/db/products/schema';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

type TabId = 'about' | 'specification' | 'pq-curve' | 'help-documents' | 'accessories';

interface ProductPageContentProps {
  slug: string;
}

// ============================================================================
// Tabs Configuration
// ============================================================================

const TABS: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About product' },
  { id: 'specification', label: 'Specification' },
  { id: 'pq-curve', label: 'PQ Curve' },
  { id: 'help-documents', label: 'Help Documents' },
  { id: 'accessories', label: 'Accessories' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatRangeValue(
  min: number | undefined,
  max: number | undefined,
  unit: string
): string {
  if (min === undefined && max === undefined) return '—';
  if (min === undefined) return `0 - ${max} ${unit}`;
  if (max === undefined) return `${min} - — ${unit}`;
  return `${min} - ${max} ${unit}`;
}

function formatValue(value: number | string | undefined, fallback = '—'): string {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

// ============================================================================
// Product Page Content Component
// ============================================================================

function ProductPageContent({ slug }: ProductPageContentProps) {
  const searchParams = useSearchParams();
  const countryKey = searchParams.get('country') || '';

  // State
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${encodeURIComponent(slug)}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to fetch product');
        }

        setProduct(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Find the market spec for the selected country
  const selectedMarketSpec: ProductMarketSpec | null = useMemo(() => {
    if (!product?.marketSpecs || product.marketSpecs.length === 0) return null;

    // Try to find a matching market spec for the country
    if (countryKey) {
      const match = product.marketSpecs.find(
        (spec) => spec.countryKey.toLowerCase() === countryKey.toLowerCase()
      );
      if (match) return match;
    }

    // Fall back to the first available market spec
    return product.marketSpecs[0] || null;
  }, [product, countryKey]);

  // Get the market availability text
  const marketAvailabilityText = useMemo(() => {
    if (!product?.marketSpecs || product.marketSpecs.length === 0) {
      return 'No market specifications available';
    }

    const regions = [...new Set(product.marketSpecs.map((s) => s.regionCode))];
    const countries = product.marketSpecs.map((s) => s.countryKey);

    return `${regions.join(', ')}, ${countries.join(', ')}`;
  }, [product]);

  // Get primary image
  const primaryImage = useMemo(() => {
    if (!product?.assets?.images) return null;
    return (
      product.assets.images.find((img) => img.type === 'primary') ||
      product.assets.images[0] ||
      null
    );
  }, [product]);

  // Get PQ curve data for chart
  const pqCurveData = useMemo(() => {
    if (!selectedMarketSpec?.pqCurves || selectedMarketSpec.pqCurves.length === 0) {
      return null;
    }

    return selectedMarketSpec.pqCurves;
  }, [selectedMarketSpec]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="aspect-square bg-gray-200 rounded-lg" />
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 mx-auto text-red-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-red-700 mb-2">
                Product Not Found
              </h2>
              <p className="text-red-600 mb-4">
                {error || 'The requested product could not be found.'}
              </p>
              <Link
                href="/product-lists"
                className="inline-flex items-center text-[var(--primary)] hover:underline"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to product list
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
      <Header />

      <main className="flex-grow">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
            <Link href="/" className="hover:text-[var(--foreground)]">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/product-lists" className="hover:text-[var(--foreground)]">
              Products
            </Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hover:text-[var(--foreground)]">
              {product.categoryCode || 'Category'}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hover:text-[var(--foreground)]">
              {product.subcategoryCode || 'Subcategory'}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--foreground)] font-medium">{product.modelCode}</span>
          </nav>

          {/* Back to list link */}
          <Link
            href="/product-lists"
            className="inline-flex items-center gap-1 text-sm text-[var(--foreground)] mb-6 hover:text-[var(--primary)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to list
          </Link>

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Left Column - Images */}
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="hidden sm:flex flex-col gap-2">
                <div className="w-16 h-16 border border-[var(--border)] rounded-lg bg-white p-1 flex items-center justify-center">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt || product.modelCode}
                      width={56}
                      height={56}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded" />
                  )}
                </div>
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-white border border-[var(--border)] rounded-lg p-6 flex items-center justify-center min-h-[300px] lg:min-h-[400px] lg:min-w-[400px]">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt || product.modelCode}
                    width={400}
                    height={400}
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="flex-1 lg:min-w-[350px]">
              {/* Title and Download Icon */}
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-[var(--foreground)]">
                  {product.modelCode}
                </h1>
                <button
                  type="button"
                  className="p-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
                  title="Download datasheet"
                >
                  <svg
                    className="w-5 h-5 text-[var(--primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>

              {/* Market Availability Notice */}
              <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Model Specifications are provided only for: {marketAvailabilityText}</span>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4 mb-8">
                {/* Air Volume */}
                <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                  <span className="text-[var(--foreground)] font-medium">Air volume</span>
                  <span className="text-[var(--foreground)]">
                    {formatRangeValue(
                      selectedMarketSpec?.fanSpec?.airVolume?.min,
                      selectedMarketSpec?.fanSpec?.airVolume?.max,
                      'CMH'
                    )}
                  </span>
                </div>

                {/* Static Pressure */}
                <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                  <span className="text-[var(--foreground)] font-medium">Static pressure</span>
                  <span className="text-[var(--foreground)]">
                    {formatRangeValue(
                      selectedMarketSpec?.fanSpec?.staticPressure?.min,
                      selectedMarketSpec?.fanSpec?.staticPressure?.max,
                      'Pa'
                    )}
                  </span>
                </div>

                {/* Noise */}
                <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                  <span className="text-[var(--foreground)] font-medium">Noise</span>
                  <span className="text-[var(--foreground)]">
                    {selectedMarketSpec?.fanSpec?.noiseLevel !== undefined
                      ? `${selectedMarketSpec.fanSpec.noiseLevel} dBA`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                className="w-full py-3 px-6 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
              >
                Get free consultation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'bg-[var(--foreground)] text-white'
                      : 'text-[var(--foreground)] hover:bg-gray-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {/* About Product Tab */}
            {activeTab === 'about' && (
              <AboutProductTab product={product} />
            )}

            {/* Specification Tab */}
            {activeTab === 'specification' && (
              <SpecificationTab
                product={product}
                marketSpec={selectedMarketSpec}
                marketAvailabilityText={marketAvailabilityText}
                showAllSpecs={showAllSpecs}
                onToggleShowAll={() => setShowAllSpecs(!showAllSpecs)}
              />
            )}

            {/* PQ Curve Tab */}
            {activeTab === 'pq-curve' && (
              <PQCurveTab
                marketAvailabilityText={marketAvailabilityText}
                pqCurves={pqCurveData}
              />
            )}

            {/* Help Documents Tab */}
            {activeTab === 'help-documents' && (
              <HelpDocumentsTab product={product} />
            )}

            {/* Accessories Tab */}
            {activeTab === 'accessories' && (
              <AccessoriesTab />
            )}
          </div>

          {/* Related Products Section */}
          <RelatedProductsSection
            relatedModelCodes={product.relatedModelCodes}
            countryKey={countryKey}
          />
        </div>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}

// ============================================================================
// About Product Tab Component
// ============================================================================

function AboutProductTab({ product }: { product: ProductResponse }) {
  const highlights = product.highlights || [];

  // Default placeholder highlights
  const defaultHighlights = [
    'Condenser motor with thermal cutoff',
    'Lubricated sintered bush for long life operation',
    'Highly efficient sirocco fan',
    'Blind shutter louver enhances privacy and safety',
  ];

  // Use product highlights or fall back to defaults
  const displayHighlights = highlights.length > 0 ? highlights : defaultHighlights;

  // Ensure we always have 4 tiles
  const tiles = [...displayHighlights.slice(0, 4)];
  while (tiles.length < 4) {
    tiles.push(defaultHighlights[tiles.length] || 'Product feature');
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tiles.map((highlight, index) => (
        <div
          key={index}
          className={`relative h-48 rounded-lg overflow-hidden ${index % 3 === 0 ? 'bg-gray-100' : index % 2 === 0 ? 'bg-gray-100' : 'bg-gradient-to-br from-gray-300 to-gray-500'
            }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <p className={`text-sm font-medium ${index % 2 === 0 ? 'text-[var(--primary)]' : 'text-white'}`}>
              {highlight}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Specification Tab Component
// ============================================================================

interface SpecificationTabProps {
  product: ProductResponse;
  marketSpec: ProductMarketSpec | null;
  marketAvailabilityText: string;
  showAllSpecs: boolean;
  onToggleShowAll: () => void;
}

function SpecificationTab({
  product,
  marketSpec,
  marketAvailabilityText,
  showAllSpecs,
  onToggleShowAll,
}: SpecificationTabProps) {
  // Get dimension image
  const dimensionImage = product.assets?.images?.find((img) => img.type === 'technical');

  return (
    <div>
      {/* Market Availability Notice */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Model Specifications are provided only for: {marketAvailabilityText}</span>
      </div>

      {/* Voltage and Frequency Chips */}
      <div className="flex gap-4 mb-8">
        <div>
          <span className="text-sm text-[var(--foreground)] font-medium mr-2">Voltage</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--foreground)] text-white text-sm">
            {marketSpec?.electrical?.voltage || '—'} V
          </span>
        </div>
        <div>
          <span className="text-sm text-[var(--foreground)] font-medium mr-2">Frequency</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--foreground)] text-white text-sm">
            {marketSpec?.electrical?.frequency || '—'} Hz
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Specification Tables */}
        <div className="flex-1">
          {/* Fan Specification */}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Fan Specification:</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Fan Sub Type</span>
              <span className="text-[var(--foreground)]">
                {formatValue(undefined, 'Forward Curve')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Power Consumption [W]</span>
              <span className="text-[var(--foreground)]">
                {formatValue(marketSpec?.electrical?.powerInput)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Fan Speed [Rpm]</span>
              <span className="text-[var(--foreground)]">
                {formatValue(marketSpec?.fanSpec?.rpm)}
              </span>
            </div>
          </div>

          {/* Construction */}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Construction:</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Duct Size [mm]</span>
              <span className="text-[var(--foreground)]">
                {formatValue(marketSpec?.construction?.ductSize)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Speed Control</span>
              <span className="text-[var(--foreground)]">
                Single
              </span>
            </div>
          </div>

          {/* Additional Specs (shown when expanded) */}
          {showAllSpecs && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Material</span>
                <span className="text-[var(--foreground)]">
                  {formatValue(marketSpec?.construction?.material)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Weight [kg]</span>
                <span className="text-[var(--foreground)]">
                  {formatValue(marketSpec?.construction?.weight)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">IP Rating</span>
                <span className="text-[var(--foreground)]">
                  {formatValue(marketSpec?.construction?.ipRating)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Mounting Type</span>
                <span className="text-[var(--foreground)]">
                  {formatValue(marketSpec?.construction?.mountingType)}
                </span>
              </div>
            </div>
          )}

          {/* Show All Toggle */}
          <button
            type="button"
            onClick={onToggleShowAll}
            className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            {showAllSpecs ? 'Show less' : 'Show all'}
            <svg
              className={`w-4 h-4 transition-transform ${showAllSpecs ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Right - Dimension Drawing */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--primary)]">Dimension</h3>
            <span className="text-sm text-[var(--primary)]">Unit : mm</span>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-lg p-4 flex flex-col items-center">
            {dimensionImage ? (
              <Image
                src={dimensionImage.url}
                alt="Product dimensions"
                width={400}
                height={300}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-dimension.svg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
            )}
            <p className="text-sm text-[var(--muted)] mt-2">Model: {product.modelCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PQ Curve Tab Component
// ============================================================================

interface PQCurveTabProps {
  marketAvailabilityText: string;
  pqCurves: ProductPQSeries[] | null;
}

function PQCurveTab({ marketAvailabilityText, pqCurves }: PQCurveTabProps) {
  // Transform PQ curve data for Recharts
  const chartData = useMemo(() => {
    if (!pqCurves || pqCurves.length === 0) return null;

    // Get all unique air volume values across all curves
    const allPoints: { airVolume: number;[key: string]: number }[] = [];

    pqCurves.forEach((curve, index) => {
      curve.points.forEach((point) => {
        const existing = allPoints.find((p) => p.airVolume === point.airVolume);
        const key = `curve${index}`;
        if (existing) {
          existing[key] = point.staticPressure;
        } else {
          allPoints.push({
            airVolume: point.airVolume,
            [key]: point.staticPressure,
          });
        }
      });
    });

    // Sort by air volume
    return allPoints.sort((a, b) => a.airVolume - b.airVolume);
  }, [pqCurves]);

  return (
    <div>
      {/* Market Availability Notice */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Model Specifications are provided only for: {marketAvailabilityText}</span>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="airVolume"
                label={{
                  value: 'Air Volume, CMH',
                  position: 'insideBottom',
                  offset: -10,
                  style: { fontSize: 12, fill: '#6b7280' },
                }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                label={{
                  value: 'Static Pressure, Pa',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#6b7280' },
                }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => {
                  const index = parseInt(value.replace('curve', ''), 10);
                  return pqCurves?.[index]?.label || 'PQ Curve (Hi Speed)';
                }}
              />
              {pqCurves?.map((curve, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`curve${index}`}
                  name={`curve${index}`}
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-lg p-8 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          <p className="text-[var(--muted)]">No PQ curve data available for this product</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Help Documents Tab Component
// ============================================================================

function HelpDocumentsTab({ product }: { product: ProductResponse }) {
  const documents = product.assets?.documents || [];

  return (
    <div>
      {/* Download All Header */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
          disabled={documents.length === 0}
        >
          Download all files
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-[var(--border)]"
            >
              <span className="text-[var(--foreground)]">
                {doc.title || `KDK ${product.categoryCode}`}
              </span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Download"
              >
                <svg
                  className="w-5 h-5 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <span className="text-[var(--foreground)]">
              KDK {product.categoryCode}
            </span>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Download"
            >
              <svg
                className="w-5 h-5 text-[var(--muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Accessories Tab Component
// ============================================================================

function AccessoriesTab() {
  return (
    <div className="py-8">
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>No accessories are available for this product</span>
      </div>
    </div>
  );
}

// ============================================================================
// Related Products Section Component
// ============================================================================

interface RelatedProductsSectionProps {
  relatedModelCodes: string[];
  countryKey: string;
}

function RelatedProductsSection({
  relatedModelCodes,
  countryKey,
}: RelatedProductsSectionProps) {
  const hasRelated = relatedModelCodes && relatedModelCodes.length > 0;

  return (
    <div className="border-t border-[var(--border)] pt-8">
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
        Related products
      </h2>
      {hasRelated ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {relatedModelCodes.map((modelCode) => (
            <Link
              key={modelCode}
              href={`/products/${modelCode.toLowerCase()}/?country=${countryKey}&air_volume=&static_pressure=&air_volume_unit=CMH&static_pressure_unit=Pa`}
              className="block p-4 bg-white border border-[var(--border)] rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--foreground)] text-center">
                {modelCode}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>No related products are available for this product</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Scroll to Top Button Component
// ============================================================================

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center z-50"
      title="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

interface ProductPageProps {
  params: Promise<{ product: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.product));
  }, [params]);

  if (!slug) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-[var(--muted)]">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-[var(--muted)]">Loading...</div>
          </main>
          <Footer />
        </div>
      }
    >
      <ProductPageContent slug={slug} />
    </Suspense>
  );
}
