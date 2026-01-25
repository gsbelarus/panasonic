import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProductResponse } from '@/lib/db/products/schema';

// ============================================================================
// Types
// ============================================================================

export interface ProductFilters {
  regionCode?: string;
  countryKey?: string;
  categoryCode?: string;
  subcategoryCode?: string;
  voltage?: string[];
  q?: string;
}

export interface ProductsPagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface UseProductsResult {
  products: ProductResponse[];
  loading: boolean;
  error: string | null;
  pagination: ProductsPagination;
  fetchProducts: (filters: ProductFilters, reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

const DEFAULT_LIMIT = 12;

/**
 * Hook to fetch products with filtering and pagination
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductsPagination>({
    total: 0,
    limit: DEFAULT_LIMIT,
    skip: 0,
    hasMore: false,
  });
  const paginationRef = useRef<ProductsPagination>({
    total: 0,
    limit: DEFAULT_LIMIT,
    skip: 0,
    hasMore: false,
  });
  const currentFiltersRef = useRef<ProductFilters>({});
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchProducts = useCallback(async (filters: ProductFilters, reset = true) => {
    let requestId = 0;
    let controller: AbortController | null = null;
    try {
      requestIdRef.current += 1;
      requestId = requestIdRef.current;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();

      if (filters.regionCode) {
        params.set('regionCode', filters.regionCode);
      }
      if (filters.countryKey) {
        params.set('countryKey', filters.countryKey);
      }
      if (filters.categoryCode) {
        params.set('categoryCode', filters.categoryCode);
      }
      if (filters.subcategoryCode) {
        params.set('subcategoryCode', filters.subcategoryCode);
      }
      if (filters.voltage && filters.voltage.length > 0) {
        params.set('voltage', filters.voltage.join(','));
      }
      if (filters.q) {
        params.set('q', filters.q);
      }

      params.set('limit', String(DEFAULT_LIMIT));
      const nextSkip = reset ? 0 : paginationRef.current.skip + paginationRef.current.limit;
      params.set('skip', String(nextSkip));

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(null);

      if (reset) {
        setProducts(data.data);
      } else {
        setProducts((prev) => [...prev, ...data.data]);
      }

      setPagination(data.pagination);
      paginationRef.current = data.pagination;

      currentFiltersRef.current = filters;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      if (controller?.signal.aborted) {
        return;
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      console.error('[useProducts] Error:', err);
    } finally {
      if (controller?.signal.aborted) return;
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!paginationRef.current.hasMore || loading) return;
    await fetchProducts(currentFiltersRef.current, false);
  }, [fetchProducts, loading]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    loadMore,
  };
}

/**
 * Hook to fetch products initially when region and country are selected
 */
export function useProductsWithAutoFetch(filters: ProductFilters): UseProductsResult {
  const result = useProducts();

  const voltageKey = filters.voltage?.join(',') || '';

  useEffect(() => {
    // Only fetch if region and country are selected
    if (filters.regionCode && filters.countryKey) {
      result.fetchProducts(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.regionCode,
    filters.countryKey,
    filters.categoryCode,
    filters.subcategoryCode,
    voltageKey,
    filters.q,
  ]);

  return result;
}
