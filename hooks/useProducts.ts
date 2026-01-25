import { useState, useEffect, useCallback } from 'react';
import type { ProductResponse, ProductsApiResponse, ProductApiResponse } from '@/lib/db/schemas';

interface UseProductsOptions {
  categoryCode?: string;
  subcategoryCode?: string;
  regionCode?: string;
  countryName?: string;
  isActive?: boolean;
}

interface UseProductsResult {
  products: ProductResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching products with optional filters
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();

      if (options.categoryCode) {
        params.set('categoryCode', options.categoryCode);
      }
      if (options.subcategoryCode) {
        params.set('subcategoryCode', options.subcategoryCode);
      }
      if (options.regionCode) {
        params.set('regionCode', options.regionCode);
      }
      if (options.countryName) {
        params.set('countryName', options.countryName);
      }
      if (options.isActive !== undefined) {
        params.set('isActive', String(options.isActive));
      }

      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { signal });
      const data: ProductsApiResponse = await response.json();

      if (!data.success) {
        throw new Error('error' in data ? String(data.error) : 'Failed to fetch products');
      }

      setProducts(data.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [options.categoryCode, options.subcategoryCode, options.regionCode, options.countryName, options.isActive]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

interface UseProductResult {
  product: ProductResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching a single product by slug or modelCode
 */
export function useProduct(slugOrModelCode: string | null): UseProductResult {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (signal?: AbortSignal) => {
    if (!slugOrModelCode) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${encodeURIComponent(slugOrModelCode)}`, { signal });
      const data: ProductApiResponse = await response.json();

      if (!data.success) {
        throw new Error('error' in data ? String(data.error) : 'Failed to fetch product');
      }

      setProduct(data.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [slugOrModelCode]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
}

/**
 * Helper function to get working point headline values for product cards
 */
export function getProductHeadlineValues(product: ProductResponse, marketIndex = 0) {
  const marketSpec = product.marketSpecs[marketIndex];

  if (!marketSpec) {
    return {
      airVolumeMax: null,
      staticPressureMax: null,
      noiseLevel: null,
    };
  }

  return {
    airVolumeMax: marketSpec.workingPoint.airVolume.max,
    staticPressureMax: marketSpec.workingPoint.staticPressure.max,
    noiseLevel: marketSpec.workingPoint.noise.value,
    airVolumeUnit: marketSpec.workingPoint.airVolume.unit,
    staticPressureUnit: marketSpec.workingPoint.staticPressure.unit,
    noiseUnit: marketSpec.workingPoint.noise.unit,
  };
}

/**
 * Helper function to find market spec for a specific region/country
 */
export function findMarketSpec(
  product: ProductResponse,
  regionCode?: string,
  countryName?: string
) {
  return product.marketSpecs.find((spec) => {
    if (regionCode && spec.regionCode !== regionCode) {
      return false;
    }
    if (countryName && spec.countryName !== countryName) {
      return false;
    }
    return true;
  });
}
