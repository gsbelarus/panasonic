import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/CI_RED-Converted.png"
              alt="KDK Logo"
              width={61}
              height={61}
            />
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Support
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            © 2026 KDK Ventilation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
