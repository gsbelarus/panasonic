'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiltersPanel, type FilterState } from '@/components/filters';
import { ProductCard, ProductCardSkeleton, ProductsEmptyState } from '@/components/ProductCard';
import { GenerateReportModal, ReportSuccessNotification } from '@/components/GenerateReportModal';
import { useRegions, useCountriesByRegion } from '@/hooks/useRegionsAndCountries';
import { useCategories, useSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import { useProducts, type ProductFilters } from '@/hooks/useProducts';
import type { ProductResponse } from '@/lib/db/products/schema';
import { useRouter, useSearchParams } from 'next/navigation';

// ============================================================================
// View Mode Type
// ============================================================================

type ViewMode = 'grid' | 'list';

// ============================================================================
// Initial Filter State
// ============================================================================

const initialFilterState: FilterState = {
  regionCode: '',
  countryKey: '',
  selectedCategories: [],
  selectedSubcategories: [],
  selectedVoltages: [],
  airVolumeUnit: 'CMH',
  airVolumeValue: 0,
  staticPressureUnit: 'Pa',
  staticPressureValue: 0,
  searchQuery: '',
};

// ============================================================================
// Page Component
// ============================================================================

export default function ProductListsPage() {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCategoryCodes = useMemo(() => {
    const categoryParam = searchParams.get('categoryCode');
    if (!categoryParam) return [] as string[];

    return categoryParam
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }, [searchParams]);
  const hasCategoryParam = searchParams.has('categoryCode');

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilterState,
    selectedCategories: urlCategoryCodes,
  }));

  // Mobile filters panel state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Comparison state
  const [comparisonProducts, setComparisonProducts] = useState<Set<string>>(new Set());

  // Report modal state
  const [reportModalProduct, setReportModalProduct] = useState<ProductResponse | null>(null);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState('');
  const pendingQueryRef = useRef<string | null>(null);

  // Data hooks
  const { regions, loading: regionsLoading } = useRegions();
  const { countries, loading: countriesLoading } = useCountriesByRegion(filters.regionCode);
  const { categories, loading: categoriesLoading } = useCategories();
  const { subcategories } = useSubcategories();
  const {
    products,
    loading: productsLoading,
    error: productsError,
    pagination,
    fetchProducts,
    loadMore,
    resetProducts,
  } = useProducts();

  const handleFiltersChange = useCallback(
    (nextFilters: FilterState | ((prev: FilterState) => FilterState)) => {
      setFilters((prev) => {
        const resolved =
          typeof nextFilters === 'function' ? nextFilters(prev) : nextFilters;

        const params = new URLSearchParams(searchParams.toString());
        if (resolved.selectedCategories.length > 0) {
          params.set('categoryCode', resolved.selectedCategories.join(','));
        } else {
          params.delete('categoryCode');
        }

        const queryString = params.toString();
        pendingQueryRef.current = queryString ? `?${queryString}` : '/product-lists';

        return resolved;
      });
    },
    [searchParams]
  );

  // Sync local selected categories when URL changes (back/forward navigation)
  useEffect(() => {
    if (!hasCategoryParam && filters.selectedCategories.length === 0) return;

    const isSameSelection =
      filters.selectedCategories.length === urlCategoryCodes.length &&
      filters.selectedCategories.every((code) => urlCategoryCodes.includes(code));

    if (isSameSelection) return;
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        selectedCategories: urlCategoryCodes,
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [hasCategoryParam, urlCategoryCodes, filters.selectedCategories]);

  useEffect(() => {
    if (!pendingQueryRef.current) return;
    router.replace(pendingQueryRef.current, { scroll: false });
    pendingQueryRef.current = null;
  }, [router, filters]);

  // Fetch products when filters change
  useEffect(() => {
    // Only fetch if region and country are selected
    if (filters.regionCode && filters.countryKey) {
      const productFilters: ProductFilters = {
        regionCode: filters.regionCode,
        countryKey: filters.countryKey,
        categoryCode:
          filters.selectedCategories.length > 0
            ? filters.selectedCategories.join(',')
            : undefined,
        subcategoryCode:
          filters.selectedSubcategories.length > 0
            ? filters.selectedSubcategories.join(',')
            : undefined,
        voltage: filters.selectedVoltages.length > 0 ? filters.selectedVoltages : undefined,
        q: filters.searchQuery || undefined,
      };
      fetchProducts(productFilters);
    } else {
      resetProducts();
    }
  }, [
    filters.regionCode,
    filters.countryKey,
    filters.selectedCategories,
    filters.selectedSubcategories,
    filters.selectedVoltages,
    filters.searchQuery,
    fetchProducts,
    resetProducts,
  ]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters.searchQuery]);

  // Category name lookup
  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.code, cat.name));
    return map;
  }, [categories]);

  // Determine if we should show the empty location state
  const showLocationEmptyState = !filters.regionCode || !filters.countryKey;

  // Determine if we have no results after filtering
  const showNoResultsState =
    !showLocationEmptyState && !productsLoading && !productsError && products.length === 0;

  // Handle comparison toggle
  const handleCompareChange = (productId: string, selected: boolean) => {
    const newComparisonProducts = new Set(comparisonProducts);
    if (selected) {
      if (newComparisonProducts.size < 3) {
        newComparisonProducts.add(productId);
      }
    } else {
      newComparisonProducts.delete(productId);
    }
    setComparisonProducts(newComparisonProducts);
  };

  const comparisonIds = useMemo(() => Array.from(comparisonProducts), [comparisonProducts]);
  const comparisonHref = comparisonIds.length > 0
    ? `/comparison?ids=${encodeURIComponent(comparisonIds.join(','))}`
    : '/comparison';

  // Handle report generation (stubbed)
  const handleGenerateReport = (type: 'jpeg' | 'pdf', options: string[]) => {
    console.log(`Generating ${type} report with options:`, options);
    // Stub: In a real implementation, this would call an API to generate the report
    setShowReportSuccess(true);
    setTimeout(() => setShowReportSuccess(false), 3000);
  };

  // Handle select location button click
  const handleSelectLocation = () => {
    // On mobile, open the filters panel
    if (window.innerWidth < 1024) {
      setIsMobileFiltersOpen(true);
    } else {
      // On desktop, scroll to the filters panel
      const filtersElement = document.getElementById('filters-panel');
      if (filtersElement) {
        filtersElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--secondary)]">
      <Header />

      <main className="flex-grow">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[var(--foreground)]">
              Results found:{' '}
              <span className="font-semibold">{pagination.total}</span> items
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile Filters Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Filters</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="22"
                  viewBox="0 0 21 22"
                  fill="none"
                >
                  <path
                    d="M19.5 3H12.5M8.5 3H1.5M19.5 11H10.5M6.5 11H1.5M19.5 19H14.5M10.5 19H1.5M12.5 1V5M6.5 9V13M14.5 17V21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-white border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list'
                      ? 'bg-gray-100 text-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    title="Show as list"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M16 12H3M16 18H3M16 6H3M21 12H21.01M21 18H21.01M21 6H21.01"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid'
                      ? 'bg-gray-100 text-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    title="Show as grid"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 12H21M12 3V21M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Filters Panel */}
            <div id="filters-panel">
              <FiltersPanel
                regions={regions}
                countries={countries}
                categories={categories}
                subcategories={subcategories}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearAll={() => setSearchInput('')}
                regionsLoading={regionsLoading}
                countriesLoading={countriesLoading}
                categoriesLoading={categoriesLoading}
                isMobileOpen={isMobileFiltersOpen}
                onMobileClose={() => setIsMobileFiltersOpen(false)}
              />
            </div>

            {/* Products Area */}
            <div className="flex-grow min-w-0">
              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for a model or category..."
                    className="w-full px-4 py-3 pl-10 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Empty State - No Location Selected */}
              {showLocationEmptyState && (
                <ProductsEmptyState
                  showLocationPrompt
                  onSelectLocation={handleSelectLocation}
                />
              )}

              {/* Empty State - No Results */}
              {showNoResultsState && (
                <ProductsEmptyState showLocationPrompt={false} />
              )}

              {/* Error State */}
              {productsError && !showLocationEmptyState && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-red-600">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.57 20.74C2.88 20.92 3.23 21.01 3.59 21H20.53C20.89 21.01 21.24 20.92 21.55 20.74C21.86 20.56 22.12 20.3 22.3 20C22.48 19.7 22.57 19.36 22.57 19C22.57 18.64 22.48 18.3 22.3 18L13.83 3.86C13.65 3.56 13.39 3.32 13.08 3.15C12.77 2.98 12.42 2.89 12.06 2.89C11.7 2.89 11.35 2.98 11.04 3.15C10.73 3.32 10.47 3.56 10.29 3.86Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 9V13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 17H12.01"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Unable to load products</p>
                      <p className="text-sm text-red-600">{productsError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {productsLoading && !showLocationEmptyState && products.length === 0 && (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-4'
                  }
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} viewMode={viewMode} />
                  ))}
                </div>
              )}

              {/* Products Grid/List */}
              {!showLocationEmptyState && !showNoResultsState && products.length > 0 && (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-4'
                    }
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        viewMode={viewMode}
                        isCompareSelected={comparisonProducts.has(product._id)}
                        onCompareChange={(selected) =>
                          handleCompareChange(product._id, selected)
                        }
                        onGenerateReport={() => setReportModalProduct(product)}
                        categoryName={categoryNameMap.get(product.categoryCode)}
                      />
                    ))}
                  </div>

                  {/* Show More Button */}
                  {pagination.hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={productsLoading}
                        className="px-8 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {productsLoading ? 'Loading...' : 'Show more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Comparison Footer */}
      {comparisonProducts.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] shadow-lg z-40">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">
              {comparisonProducts.size} of 3 products has been added to comparison.
            </span>
            <div className="flex items-center gap-4">
              <a
                href={comparisonHref}
                className="px-6 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Compare
              </a>
              <button
                type="button"
                onClick={() => setComparisonProducts(new Set())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear comparison"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="#6D7B7D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Generate Report Modal */}
      <GenerateReportModal
        key={reportModalProduct?.modelCode || 'report-modal'}
        isOpen={!!reportModalProduct}
        onClose={() => setReportModalProduct(null)}
        productModelCode={reportModalProduct?.modelCode || ''}
        onGenerate={handleGenerateReport}
      />

      {/* Report Success Notification */}
      <ReportSuccessNotification
        isVisible={showReportSuccess}
        onClose={() => setShowReportSuccess(false)}
      />
    </div>
  );
}
