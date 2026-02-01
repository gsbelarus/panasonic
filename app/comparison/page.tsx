'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { ProductResponse, ProductMarketSpec } from '@/lib/db/products/schema';

// ============================================================================
// Types
// ============================================================================

interface ComparisonProduct {
  product: ProductResponse;
  marketSpec: ProductMarketSpec | null;
}

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
// Comparison Page Content
// ============================================================================

function ComparisonPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const countryKey = searchParams.get('country') || '';
  const productsParam = searchParams.get('products') || '';

  // Parse product slugs from URL
  const productSlugs = useMemo(() => {
    if (!productsParam) return [];
    return productsParam.split(',').map((slug) => slug.trim()).filter(Boolean);
  }, [productsParam]);

  // State
  const [products, setProducts] = useState<ComparisonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // Fetch products by slugs
  useEffect(() => {
    if (productSlugs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const currentRequestId = ++requestIdRef.current;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all products in parallel by slug
        const responses = await Promise.all(
          productSlugs.map((slug) =>
            fetch(`/api/products/${encodeURIComponent(slug)}`, {
              signal: controller.signal,
            }).then((res) => res.json())
          )
        );

        if (controller.signal.aborted || requestIdRef.current !== currentRequestId) {
          return;
        }

        const fetchedProducts: ComparisonProduct[] = responses
          .filter((res) => res.success && res.data)
          .map((res) => {
            const product = res.data as ProductResponse;
            // Find the market spec for the selected country
            let marketSpec: ProductMarketSpec | null = null;
            if (product.marketSpecs && product.marketSpecs.length > 0) {
              if (countryKey) {
                marketSpec = product.marketSpecs.find(
                  (spec) => spec.countryKey.toLowerCase() === countryKey.toLowerCase()
                ) || product.marketSpecs[0];
              } else {
                marketSpec = product.marketSpecs[0];
              }
            }
            return { product, marketSpec };
          });

        setProducts(fetchedProducts);
      } catch (err) {
        if (controller.signal.aborted || requestIdRef.current !== currentRequestId) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        if (!controller.signal.aborted && requestIdRef.current === currentRequestId) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [productSlugs, countryKey]);

  // Remove a product from comparison
  const handleRemoveProduct = (productSlug: string) => {
    const newSlugs = productSlugs.filter((slug) => slug !== productSlug);
    if (newSlugs.length === 0) {
      router.push('/product-lists');
    } else {
      const params = new URLSearchParams();
      params.set('products', newSlugs.join(','));
      if (countryKey) params.set('country', countryKey);
      router.replace(`/comparison?${params.toString()}`);
    }
  };

  // Get primary image for a product
  const getPrimaryImage = (product: ProductResponse) => {
    const img = product.assets?.images?.find((img) => img.type === 'primary') ||
      product.assets?.images?.[0];
    return img?.url || '/12nsb-15nsb-18nsb-18nfb-1-1-scaled.jpg';
  };

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No Products to Compare
              </h2>
              <p className="text-[var(--muted)] mb-6">
                Select products from the product list to compare their specifications.
              </p>
              <Link
                href="/product-lists"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
            <div className="h-6 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
        <Header />
        <main className="flex-grow">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
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
              <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Products</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Link
                href="/product-lists"
                className="inline-flex items-center text-[var(--primary)] hover:underline"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

  // Calculate grid columns based on number of products
  const gridCols = products.length === 1 ? 'grid-cols-1' :
    products.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
      'grid-cols-1 md:grid-cols-3';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
      <Header />

      <main className="flex-grow">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
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
            <span className="text-[var(--foreground)] font-medium">Compare Products</span>
          </nav>

          {/* Back link */}
          <Link
            href="/product-lists"
            className="inline-flex items-center gap-1 text-sm text-[var(--foreground)] mb-6 hover:text-[var(--primary)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to product list
          </Link>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-8">
            Compare Products ({products.length})
          </h1>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
            {/* Product Headers */}
            <div className={`grid ${gridCols} divide-x divide-[var(--border)]`}>
              {products.map(({ product }) => (
                <div key={product.slug} className="p-6">
                  {/* Remove Button */}
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.slug)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from comparison"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={getPrimaryImage(product)}
                      alt={product.modelCode}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>

                  {/* Product Name */}
                  <h2 className="text-lg font-semibold text-[var(--foreground)] text-center mb-2">
                    <Link
                      href={`/products/${product.slug}/?country=${countryKey}`}
                      className="hover:text-[var(--primary)] hover:underline"
                    >
                      {product.modelCode}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--muted)] text-center">
                    {product.categoryCode}
                  </p>
                </div>
              ))}
            </div>

            {/* Specifications Section */}
            <div className="border-t border-[var(--border)]">
              {/* Section Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                  Fan Specifications
                </h3>
              </div>

              {/* Air Volume */}
              <ComparisonRow
                label="Air Volume"
                values={products.map(({ marketSpec }) =>
                  formatRangeValue(
                    marketSpec?.fanSpec?.airVolume?.min,
                    marketSpec?.fanSpec?.airVolume?.max,
                    marketSpec?.fanSpec?.airVolume?.unit || 'm³/min'
                  )
                )}
                gridCols={gridCols}
              />

              {/* Static Pressure */}
              <ComparisonRow
                label="Static Pressure"
                values={products.map(({ marketSpec }) =>
                  formatRangeValue(
                    marketSpec?.fanSpec?.staticPressure?.min,
                    marketSpec?.fanSpec?.staticPressure?.max,
                    marketSpec?.fanSpec?.staticPressure?.unit || 'Pa'
                  )
                )}
                gridCols={gridCols}
              />

              {/* Noise Level */}
              <ComparisonRow
                label="Noise Level"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.fanSpec?.noiseLevel !== undefined
                    ? `${marketSpec.fanSpec.noiseLevel} ${marketSpec.fanSpec.noiseLevelUnit || 'dB(A)'}`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Fan Speed (RPM) */}
              <ComparisonRow
                label="Fan Speed"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.fanSpec?.rpm !== undefined
                    ? `${marketSpec.fanSpec.rpm} RPM`
                    : '—'
                )}
                gridCols={gridCols}
              />
            </div>

            {/* Electrical Specifications Section */}
            <div className="border-t border-[var(--border)]">
              <div className="bg-gray-50 px-6 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                  Electrical Specifications
                </h3>
              </div>

              {/* Voltage */}
              <ComparisonRow
                label="Voltage"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.electrical?.voltage
                    ? `${marketSpec.electrical.voltage} V`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Frequency */}
              <ComparisonRow
                label="Frequency"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.electrical?.frequency
                    ? `${marketSpec.electrical.frequency} Hz`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Phase */}
              <ComparisonRow
                label="Phase"
                values={products.map(({ marketSpec }) =>
                  formatValue(marketSpec?.electrical?.phase)
                )}
                gridCols={gridCols}
              />

              {/* Power Input */}
              <ComparisonRow
                label="Power Input"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.electrical?.powerInput !== undefined
                    ? `${marketSpec.electrical.powerInput} ${marketSpec.electrical.powerInputUnit || 'W'}`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Current */}
              <ComparisonRow
                label="Current"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.electrical?.current !== undefined
                    ? `${marketSpec.electrical.current} ${marketSpec.electrical.currentUnit || 'A'}`
                    : '—'
                )}
                gridCols={gridCols}
              />
            </div>

            {/* Construction Section */}
            <div className="border-t border-[var(--border)]">
              <div className="bg-gray-50 px-6 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                  Construction
                </h3>
              </div>

              {/* Duct Size */}
              <ComparisonRow
                label="Duct Size"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.construction?.ductSize !== undefined
                    ? `${marketSpec.construction.ductSize} ${marketSpec.construction.ductSizeUnit || 'mm'}`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Weight */}
              <ComparisonRow
                label="Weight"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.construction?.weight !== undefined
                    ? `${marketSpec.construction.weight} ${marketSpec.construction.weightUnit || 'kg'}`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Dimensions */}
              <ComparisonRow
                label="Dimensions (W×H×D)"
                values={products.map(({ marketSpec }) => {
                  const dims = marketSpec?.construction?.dimensions;
                  if (!dims) return '—';
                  const w = dims.width ?? '—';
                  const h = dims.height ?? '—';
                  const d = dims.depth ?? '—';
                  return `${w} × ${h} × ${d} ${dims.unit || 'mm'}`;
                })}
                gridCols={gridCols}
              />

              {/* Material */}
              <ComparisonRow
                label="Material"
                values={products.map(({ marketSpec }) =>
                  formatValue(marketSpec?.construction?.material)
                )}
                gridCols={gridCols}
              />

              {/* Color */}
              <ComparisonRow
                label="Color"
                values={products.map(({ marketSpec }) =>
                  formatValue(marketSpec?.construction?.color)
                )}
                gridCols={gridCols}
              />

              {/* IP Rating */}
              <ComparisonRow
                label="IP Rating"
                values={products.map(({ marketSpec }) =>
                  formatValue(marketSpec?.construction?.ipRating)
                )}
                gridCols={gridCols}
              />

              {/* Mounting Type */}
              <ComparisonRow
                label="Mounting Type"
                values={products.map(({ marketSpec }) =>
                  formatValue(marketSpec?.construction?.mountingType)
                )}
                gridCols={gridCols}
              />
            </div>

            {/* Working Point Section */}
            <div className="border-t border-[var(--border)]">
              <div className="bg-gray-50 px-6 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                  Working Point
                </h3>
              </div>

              {/* Working Air Volume */}
              <ComparisonRow
                label="Working Air Volume"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.workingPoint?.airVolume !== undefined
                    ? `${marketSpec.workingPoint.airVolume} ${marketSpec.workingPoint.airVolumeUnit || 'm³/min'}`
                    : '—'
                )}
                gridCols={gridCols}
              />

              {/* Working Static Pressure */}
              <ComparisonRow
                label="Working Static Pressure"
                values={products.map(({ marketSpec }) =>
                  marketSpec?.workingPoint?.staticPressure !== undefined
                    ? `${marketSpec.workingPoint.staticPressure} ${marketSpec.workingPoint.staticPressureUnit || 'Pa'}`
                    : '—'
                )}
                gridCols={gridCols}
              />
            </div>

            {/* Actions Row */}
            <div className={`grid ${gridCols} divide-x divide-[var(--border)] border-t border-[var(--border)]`}>
              {products.map(({ product }) => (
                <div key={product.slug} className="p-6 flex justify-center">
                  <Link
                    href={`/products/${product.slug}/?country=${countryKey}`}
                    className="px-6 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================
// Comparison Row Component
// ============================================================================

interface ComparisonRowProps {
  label: string;
  values: string[];
  gridCols: string;
}

function ComparisonRow({ label, values, gridCols }: ComparisonRowProps) {
  // Check if values are different to highlight
  const uniqueValues = new Set(values);
  const hasDifference = uniqueValues.size > 1;

  return (
    <div className={`grid ${gridCols} divide-x divide-[var(--border)] border-b border-[var(--border)] last:border-b-0`}>
      {/* First cell shows the label */}
      {values.map((value, index) => (
        <div key={index} className="px-6 py-4">
          {index === 0 && (
            <p className="text-sm text-[var(--muted)] mb-1">{label}</p>
          )}
          {index !== 0 && (
            <p className="text-sm text-[var(--muted)] mb-1 md:hidden">{label}</p>
          )}
          <p
            className={`text-sm font-medium ${hasDifference && value !== '—'
                ? 'text-[var(--primary)]'
                : 'text-[var(--foreground)]'
              }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export default function ComparisonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 bg-[var(--secondary)]">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-[var(--muted)]">Loading comparison...</div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ComparisonPageContent />
    </Suspense>
  );
}
