'use client';

interface HeroProps {
  onProductSelectionClick: () => void;
  onExploreCategoriesClick: () => void;
}

export default function Hero({
  onProductSelectionClick,
  onExploreCategoriesClick,
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-[var(--secondary)] to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Main headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[var(--foreground)] max-w-3xl mx-auto leading-tight">
          Find the Perfect Ventilation Solution for Your Space
        </h1>
        <p className="mt-4 text-center text-[var(--muted)] max-w-2xl mx-auto text-sm sm:text-base">
          Our product selection tool helps you find the right ventilation fan model based on your specific requirements, room size, and environmental conditions.
        </p>

        {/* Callout cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Already know what you need?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use our step-by-step product selector to find models that match your specific voltage, airflow, and pressure requirements.
            </p>
            <button
              type="button"
              onClick={onProductSelectionClick}
              className="mt-4 w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Product Selection
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Not sure where to start?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Browse our product categories to discover different types of ventilation fans and find the right solution for your application.
            </p>
            <button
              type="button"
              onClick={onExploreCategoriesClick}
              className="mt-4 w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-[var(--foreground)] bg-white border border-[var(--border)] rounded-[10px] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Explore Categories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
