'use client';

const SearchIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M21.1271 23.1551C19.3341 24.5218 17.0952 25.3333 14.6667 25.3333C8.77563 25.3333 4 20.5577 4 14.6667C4 8.77563 8.77563 4 14.6667 4C20.5577 4 25.3333 8.77563 25.3333 14.6667C25.3333 17.4284 24.2838 19.9449 22.5618 21.8393C22.5972 21.8634 22.6315 21.89 22.6644 21.9193L28.6644 27.2526C29.0771 27.6195 29.1143 28.2516 28.7474 28.6644C28.3805 29.0771 27.7484 29.1143 27.3356 28.7474L21.3356 23.4141C21.2498 23.3378 21.1802 23.25 21.1271 23.1551ZM23.3333 14.6667C23.3333 19.4531 19.4531 23.3333 14.6667 23.3333C9.8802 23.3333 6 19.4531 6 14.6667C6 9.8802 9.8802 6 14.6667 6C19.4531 6 23.3333 9.8802 23.3333 14.6667Z" fill="currentColor">
    </path>
  </svg>;

const SettingsIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 4H14M10 4H3M21 12H12M8 12H3M21 20H16M12 20H3M14 2V6M8 10V14M16 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>;


interface HeroProps {
  onProductSelectionClick: () => void;
  onExploreCategoriesClick: () => void;
}

export default function Hero({
  onProductSelectionClick,
  onExploreCategoriesClick,
}: HeroProps) {
  return (
    <section className="bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat py-12 sm:py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Main headline */}
        <h1 className="mt-28 text-3xl sm:text-2xl md:text-3xl font-thin text-center text-[var(--light-primary)] mx-auto leading-tight">
          <div>This program is to help you to select</div>
          <div>applicable models of ventilation products</div>
        </h1>

        {/* Callout cards */}
        <div className="mt-10 mb-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl h-72 mx-auto">
          {/* Card 1 */}
          <div className="w-full h-full flex flex-col bg-zinc-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg text-[var(--secondary)]">
              Already know what you need?
            </h2>
            <p className="mt-2 text-md text-zinc-400">
              Quickly find the product that fits your specific requirements: voltage frequency, air volume and static pressure.
            </p>
            <button
              type="button"
              onClick={onProductSelectionClick}
              className="mt-auto w-full sm:w-full px-8 py-4 flex flex-row gap-2 justify-center items-center text-lg font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              <SettingsIcon />
              Product Selection
            </button>
          </div>

          {/* Card 2 */}
          <div className="w-full h-full flex flex-col bg-zinc-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg text-[var(--secondary)]">
              Not sure where to start?
            </h2>
            <p className="mt-2 text-md text-zinc-400">
              Browse through categories from ceiling fans to industrial ventilation systems. We make it easy for beginners to find the right solution.
            </p>
            <button
              type="button"
              onClick={onExploreCategoriesClick}
              className="mt-auto w-full sm:w-full px-8 py-4 flex flex-row gap-2 justify-center items-center text-lg font-medium text-[var(--foreground)] bg-white border border-[var(--border)] rounded-[10px] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              <SearchIcon />
              Explore Categories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
