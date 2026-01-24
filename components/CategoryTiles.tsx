'use client';

interface CategoryTilesProps {
  onCategorySelect: (category: string) => void;
}

const categories = [
  { name: 'Wall Mount', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
  { name: 'Window Mount', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { name: 'Ceiling Mount', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Cabinet Fan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Industrial Fan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { name: 'Mini Sirocco', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Thermo Vent', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { name: 'In-line Centrifugal Fan', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Accessories', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function CategoryTiles({ onCategorySelect }: CategoryTilesProps) {
  const handleClick = (category: string) => {
    // Scroll to step 2 and select the category
    const stepElement = document.getElementById('step-category');
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Use scrollend event when available, with a conservative timeout fallback
      let fallbackTimeout: number;
      const handleScrollEnd = () => {
        window.clearTimeout(fallbackTimeout);
        (stepElement as any).removeEventListener?.('scrollend', handleScrollEnd);
        onCategorySelect(category);
      };
      (stepElement as any).addEventListener?.('scrollend', handleScrollEnd);
      fallbackTimeout = window.setTimeout(handleScrollEnd, 600);
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <section id="categories" className="py-12 sm:py-16 bg-[var(--secondary)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-8">
          Product Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => handleClick(category.name)}
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
                      d={category.icon}
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
