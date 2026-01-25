import { useState, useEffect, useCallback } from 'react';
import type { CategoryResponse, SubcategoryResponse } from '@/lib/db/schemas';

// ============================================================================
// Types
// ============================================================================

interface UseCategoriesResult {
  categories: CategoryResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubcategoriesResult {
  subcategories: SubcategoryResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubcategoriesByCategoryResult {
  subcategories: SubcategoryResponse[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all categories
 */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/categories');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
      console.error('[useCategories] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

/**
 * Hook to fetch all subcategories
 */
export function useSubcategories(): UseSubcategoriesResult {
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subcategories');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch subcategories');
      }

      setSubcategories(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subcategories';
      setError(message);
      console.error('[useSubcategories] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  return { subcategories, loading, error, refetch: fetchSubcategories };
}

/**
 * Hook to fetch subcategories filtered by category code
 */
export function useSubcategoriesByCategory(categoryCode: string | null): UseSubcategoriesByCategoryResult {
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryCode) {
      setSubcategories([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Set loading and clear stale data immediately
    setLoading(true);
    setError(null);
    setSubcategories([]);

    const controller = new AbortController();

    const fetchSubcategories = async () => {
      try {
        const response = await fetch(
          `/api/subcategories?categoryCode=${encodeURIComponent(categoryCode)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch subcategories');
        }

        setSubcategories(data.data);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to fetch subcategories';
        setError(message);
        console.error('[useSubcategoriesByCategory] Error:', err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSubcategories();

    // Cleanup: abort in-flight request when categoryCode changes
    return () => {
      controller.abort();
    };
  }, [categoryCode]);

  return { subcategories, loading, error };
}
