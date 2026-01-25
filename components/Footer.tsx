export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[var(--foreground)]"
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
            <span className="text-sm font-medium">KDK Ventilation</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Support
            </a>
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
