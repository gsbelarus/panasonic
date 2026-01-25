'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiltersPanel, type FilterState } from '@/components/filters';
import { ProductCard, ProductCardSkeleton, ProductsEmptyState } from '@/components/ProductCard';
import { GenerateReportModal, ReportSuccessNotification } from '@/components/GenerateReportModal';
import { useRegions, useCountriesByRegion } from '@/hooks/useRegionsAndCountries';
import { useCategories, useSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import { useProducts, type ProductFilters } from '@/hooks/useProducts';
import type { ProductResponse } from '@/lib/db/products/schema';

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

  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Mobile filters panel state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Comparison state
  const [comparisonProducts, setComparisonProducts] = useState<Set<string>>(new Set());

  // Report modal state
  const [reportModalProduct, setReportModalProduct] = useState<ProductResponse | null>(null);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState('');

  // Data hooks
  const { regions, loading: regionsLoading } = useRegions();
  const { countries, loading: countriesLoading } = useCountriesByRegion(filters.regionCode);
  const { categories, loading: categoriesLoading } = useCategories();
  const { subcategories } = useSubcategories();
  const { products, loading: productsLoading, pagination, fetchProducts, loadMore } = useProducts();

  // Build product filters from filter state
  const buildProductFilters = useCallback((): ProductFilters => {
    const productFilters: ProductFilters = {};

    if (filters.regionCode) {
      productFilters.regionCode = filters.regionCode;
    }
    if (filters.countryKey) {
      productFilters.countryKey = filters.countryKey;
    }
    if (filters.selectedCategories.length === 1) {
      productFilters.categoryCode = filters.selectedCategories[0];
    }
    if (filters.selectedSubcategories.length === 1) {
      productFilters.subcategoryCode = filters.selectedSubcategories[0];
    }
    if (filters.selectedVoltages.length > 0) {
      productFilters.voltage = filters.selectedVoltages;
    }
    if (filters.searchQuery) {
      productFilters.q = filters.searchQuery;
    }

    return productFilters;
  }, [filters]);

  // Fetch products when filters change
  useEffect(() => {
    // Only fetch if region and country are selected
    if (filters.regionCode && filters.countryKey) {
      const productFilters = buildProductFilters();
      fetchProducts(productFilters);
    }
  }, [
    filters.regionCode,
    filters.countryKey,
    filters.selectedCategories,
    filters.selectedSubcategories,
    filters.selectedVoltages,
    filters.searchQuery,
    buildProductFilters,
    fetchProducts,
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
    !showLocationEmptyState && !productsLoading && products.length === 0;

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
                onFiltersChange={setFilters}
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

              {/* Loading State */}
              {productsLoading && !showLocationEmptyState && (
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
              {!showLocationEmptyState && !showNoResultsState && !productsLoading && (
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
                href="/comparison"
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
