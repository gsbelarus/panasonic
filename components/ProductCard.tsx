'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductResponse } from '@/lib/db/products/schema';

// ============================================================================
// Types
// ============================================================================

interface ProductCardProps {
  product: ProductResponse;
  viewMode: 'grid' | 'list';
  isCompareSelected: boolean;
  onCompareChange: (selected: boolean) => void;
  onGenerateReport: () => void;
  categoryName?: string;
  selectedCountryKey?: string;
}

// ============================================================================
// Product Card Component
// ============================================================================

export function ProductCard({
  product,
  viewMode,
  isCompareSelected,
  onCompareChange,
  onGenerateReport,
  categoryName,
  selectedCountryKey = '',
}: ProductCardProps) {
  // Get primary image or use placeholder
  const primaryImage =
    product.assets?.images?.find((img) => img.type === 'primary') ||
    product.assets?.images?.[0];
  const imageUrl = primaryImage?.url || '/12nsb-15nsb-18nsb-18nfb-1-1-scaled.jpg';
  const imageAlt = primaryImage?.alt || product.modelCode;

  // Build product details URL
  const productDetailsUrl = `/products/${product.slug}/?country=${selectedCountryKey}&air_volume=&static_pressure=&air_volume_unit=CMH&static_pressure_unit=Pa`;

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Product Image */}
        <div className="relative aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              // Fallback to placeholder on error
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />
        </div>

        {/* Product Info */}
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          <Link href={productDetailsUrl} className="hover:text-[var(--primary)] hover:underline transition-colors">
            {product.modelCode}
          </Link>
        </h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          {categoryName || product.categoryCode}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompareSelected}
              onChange={(e) => onCompareChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-opacity-20"
            />
            <span className="text-sm text-[var(--foreground)]">Add To Comparison</span>
          </label>
          <button
            type="button"
            onClick={onGenerateReport}
            className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Generate Report"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 15L12 12L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-6">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-contain p-2"
          sizes="96px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          <Link href={productDetailsUrl} className="hover:text-[var(--primary)] hover:underline transition-colors">
            {product.modelCode}
          </Link>
        </h3>
        <p className="text-sm text-[var(--muted)]">
          {categoryName || product.categoryCode}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCompareSelected}
            onChange={(e) => onCompareChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-opacity-20"
          />
          <span className="text-sm text-[var(--foreground)] whitespace-nowrap">
            Add To Comparison
          </span>
        </label>
        <button
          type="button"
          onClick={onGenerateReport}
          className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Generate Report"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15L12 12L15 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Product Card Skeleton (Loading State)
// ============================================================================

interface ProductCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

export function ProductCardSkeleton({ viewMode }: ProductCardSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-[var(--border)] rounded-lg p-4 animate-pulse">
        <div className="aspect-square mb-4 bg-gray-200 rounded-lg" />
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-9 w-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-4 flex items-center gap-6 animate-pulse">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg" />
      <div className="flex-grow">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-9 w-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  showLocationPrompt?: boolean;
  onSelectLocation?: () => void;
}

export function ProductsEmptyState({ showLocationPrompt = true, onSelectLocation }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-6 flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.57 20.74C2.88 20.92 3.23 21.01 3.59 21H20.53C20.89 21.01 21.24 20.92 21.55 20.74C21.86 20.56 22.12 20.3 22.3 20C22.48 19.7 22.57 19.36 22.57 19C22.57 18.64 22.48 18.3 22.3 18L13.83 3.86C13.65 3.56 13.39 3.32 13.08 3.15C12.77 2.98 12.42 2.89 12.06 2.89C11.7 2.89 11.35 2.98 11.04 3.15C10.73 3.32 10.47 3.56 10.29 3.86Z"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9V13"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17H12.01"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showLocationPrompt ? (
        <>
          <p className="text-[var(--foreground)] mb-2">
            To see the list of products
            <br />
            select Region & Country first
          </p>
          {onSelectLocation && (
            <button
              type="button"
              onClick={onSelectLocation}
              className="mt-4 px-6 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 transition-colors"
            >
              Select Region & Country
            </button>
          )}
        </>
      ) : (
        <p className="text-[var(--muted)]">
          No products found matching your criteria.
          <br />
          Try adjusting your filters.
        </p>
      )}
    </div>
  );
}

export default ProductCard;
