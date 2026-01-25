'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const base = 'text-sm font-medium px-2 py-1 transition-colors';
    if (isActive(path)) {
      return `${base} text-[var(--foreground)] border-b-2 border-[var(--primary)]`;
    }
    return `${base} text-[var(--muted)] hover:text-[var(--foreground)] border-b-2 border-transparent`;
  };

  return (
    <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg text-[var(--foreground)]">
              KDK Ventilation
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-6">
            <Link href="/" className={getLinkClasses('/')}>
              Home
            </Link>
            <Link href="/product-lists" className={getLinkClasses('/product-lists')}>
              Products
            </Link>
            <Link
              href="/where-to-buy"
              className={getLinkClasses('/where-to-buy')}
            >
              Where to buy
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
