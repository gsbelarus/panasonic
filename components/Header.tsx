'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image'

const SearchIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M21.1271 23.1551C19.3341 24.5218 17.0952 25.3333 14.6667 25.3333C8.77563 25.3333 4 20.5577 4 14.6667C4 8.77563 8.77563 4 14.6667 4C20.5577 4 25.3333 8.77563 25.3333 14.6667C25.3333 17.4284 24.2838 19.9449 22.5618 21.8393C22.5972 21.8634 22.6315 21.89 22.6644 21.9193L28.6644 27.2526C29.0771 27.6195 29.1143 28.2516 28.7474 28.6644C28.3805 29.0771 27.7484 29.1143 27.3356 28.7474L21.3356 23.4141C21.2498 23.3378 21.1802 23.25 21.1271 23.1551ZM23.3333 14.6667C23.3333 19.4531 19.4531 23.3333 14.6667 23.3333C9.8802 23.3333 6 19.4531 6 14.6667C6 9.8802 9.8802 6 14.6667 6C19.4531 6 23.3333 9.8802 23.3333 14.6667Z" fill="currentColor">
    </path>
  </svg>;

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
    return `${base} text-[var(--foreground)] hover:text-[var(--primary)]`;
  };

  return (
    <header className="h-[122px] w-full flex flex-row justify-center items-center bg-white border-b border-[var(--border)] sticky top-0 z-40 text-lg">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="w-full flex items-center justify-between h-16 gap-72">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/CI_RED-Converted.png"
              alt="KDK Logo"
              width={61}
              height={61}
            />
          </Link>
          <div className='flex flex-row items-center gap-32'>
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

            <div className='flex flex-row gap-4 items-center'>
              <input
                type="text"
                placeholder="Search for a model or category..."
                className="h-11 border border-[var(--border)] rounded-2xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] text-sm bg-[var(--color-light-background)]"
              />
              <SearchIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
