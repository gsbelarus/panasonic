'use client';

import { useRef, useEffect } from 'react';
import type { StoreResponse } from '@/lib/db/schemas';

// ============================================================================
// Icons
// ============================================================================

function RouteIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <line
        x1="8.59"
        y1="13.51"
        x2="15.42"
        y2="17.49"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="15.41"
        y1="6.51"
        x2="8.59"
        y2="10.49"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

// ============================================================================
// StoreCard Component
// ============================================================================

interface StoreCardProps {
  store: StoreResponse;
  isSelected: boolean;
  onClick: () => void;
}

export default function StoreCard({ store, isSelected, onClick }: StoreCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll card into view when selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  // Build Google Maps route URL
  const buildRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.location.lat},${store.location.lng}`;

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: store.name,
      text: `${store.name} - ${store.city}, ${store.countryRegion}`,
      url: buildRouteUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(buildRouteUrl);
          alert('Link copied to clipboard!');
        } else {
          throw new Error('Clipboard API unavailable');
        }
      } catch {
        alert('Unable to copy link. Please copy it manually.');
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected
        ? 'border-[var(--primary)] bg-gray-50 shadow-md'
        : 'border-[var(--border)] bg-white hover:border-[var(--border-focus)] hover:shadow-sm'
        }`}
      onClick={onClick}
    >
      {/* Store Name */}
      <h3 className="text-base font-semibold text-[var(--primary)] mb-3 leading-tight">
        {store.name}
      </h3>

      {/* Store Details */}
      <div className="space-y-1 text-sm text-[var(--foreground)]">
        <p>
          <span className="font-medium">Country Region:</span> {store.countryRegion}
        </p>
        <p>
          <span className="font-medium">City:</span> {store.city}
        </p>
        <p>
          <span className="font-medium">Phone:</span>{' '}
          {store.phones.map((phone, index) => (
            <span key={phone}>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {phone}
              </a>
              {index < store.phones.length - 1 && ' ; '}
            </span>
          ))}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <a
          href={buildRouteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[var(--error)] hover:text-red-700 text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <RouteIcon className="w-4 h-4" />
          Build Route
        </a>

        <button
          type="button"
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          title="Share store location"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
