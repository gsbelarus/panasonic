'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const base = 'px-2 py-1 transition-colors';
    if (isActive(path)) {
      return `${base} text-[var(--primary)]`;
    }
    return `${base} text-[var(--muted)] hover:text-[var(--foreground)] border-b-2 border-transparent`;
  };

  return (
    <header className="h-[98px] w-full flex flex-row justify-center items-center bg-white border-b border-[var(--border)] sticky top-0 z-40 text-lg font-medium">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-20">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/CI_RED-Converted.png"
              alt="KDK Logo"
              width={50}
              height={50}
            />
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
