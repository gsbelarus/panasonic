'use client';

import { useCategories } from '@/hooks/useCategoriesAndSubcategories';

interface CategoryTilesProps {
  onCategorySelect: (_categoryCode: string) => void;
}

const defaultCategoryIcon =
  'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';

export default function CategoryTiles({ onCategorySelect }: CategoryTilesProps) {
  const { categories, loading, error } = useCategories();

  const handleClick = (categoryCode: string) => {
    onCategorySelect(categoryCode);
  };

  return (
    <section id="categories" className="py-12 sm:py-16 bg-[var(--secondary)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-8">
          Product Categories
        </h2>

        {error && (
          <p className="mb-4 text-xs text-[var(--error)]">
            Failed to load categories
          </p>
        )}

        {!error && loading && (
          <p className="mb-4 text-xs text-[var(--muted)]">Loading categories...</p>
        )}

        {!error && !loading && categories.length === 0 && (
          <p className="mb-4 text-xs text-[var(--muted)]">No categories available</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => handleClick(category.code)}
              className="group bg-white border border-[var(--border)] rounded-xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:border-[var(--primary)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={category.icon || defaultCategoryIcon}
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Browse products
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
