'use client';

import { useCategories } from '@/hooks/useCategoriesAndSubcategories';
import Image from 'next/image'

interface CategoryTilesProps {
  onCategorySelect: (_categoryCode: string) => void;
}

export default function CategoryTiles({ onCategorySelect }: CategoryTilesProps) {
  const { categories, loading, error } = useCategories();

  const handleClick = (categoryCode: string) => {
    onCategorySelect(categoryCode);
  };

  return (
    <section id="categories" className="py-12 sm:py-16 bg-[var(--secondary)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl text-[var(--foreground)] mb-8">
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
              className="group bg-white border border-[var(--border)] px-4 py-8 text-left transition-all duration-200 hover:shadow-lg hover:border-[var(--primary)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              <div className="flex flex-col items-center gap-16">
                <h3 className="text-2xl text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {category.name}
                </h3>
                <Image
                  src="/KDK-Landing-Page-Card_Wall-Mount-1.jpg"
                  alt="KDK"
                  width={164}
                  height={164}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
