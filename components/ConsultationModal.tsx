'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productModelCode: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// ============================================================================
// Consultation Modal Component
// ============================================================================

export function ConsultationModal({
  isOpen,
  onClose,
  productModelCode,
}: ConsultationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Phone validation: allows + and digits, minimum 7 characters
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

  // Focus trap and keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 10);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
      newErrors.email = 'Please enter a valid email address';
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(trimmedPhone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = 'Message is required';
    } else if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
      newErrors.message = 'Message must be between 10 and 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, you would send the data to your backend:
      // await fetch('/api/consultation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, productModelCode }),
      // });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit consultation request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setErrors({});
    setIsSubmitted(false);
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        role="document"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors z-10"
        >
          <svg
            width="16"
            height="17"
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.49372 0.627864C1.15201 0.286155 0.59799 0.286155 0.256282 0.627864C-0.0854272 0.969572 -0.0854272 1.52359 0.256282 1.8653L6.63756 8.24658L0.256282 14.6279C-0.0854272 14.9696 -0.0854272 15.5236 0.256282 15.8653C0.59799 16.207 1.15201 16.207 1.49372 15.8653L7.875 9.48402L14.2563 15.8653C14.598 16.207 15.152 16.207 15.4937 15.8653C15.8354 15.5236 15.8354 14.9696 15.4937 14.6279L9.11244 8.24658L15.4937 1.8653C15.8354 1.52359 15.8354 0.969572 15.4937 0.627864C15.152 0.286155 14.598 0.286155 14.2563 0.627864L7.875 7.00914L1.49372 0.627864Z"
              fill="#808A94"
            />
          </svg>
        </button>

        {isSubmitted ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Thank You!
            </h3>
            <p className="text-[var(--muted)] mb-6">
              Your consultation request for <span className="font-medium text-[var(--primary)]">{productModelCode}</span> has been submitted successfully.
              Our team will contact you within 24-48 hours.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Form State
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-[var(--border)]">
              <h3
                id="consultation-modal-title"
                className="text-xl font-semibold text-[var(--foreground)] mb-1"
              >
                Get Free Consultation
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Interested in <span className="font-medium text-[var(--primary)]">{productModelCode}</span>?
                Fill out the form below and our experts will reach out to help.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="consultation-name"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="consultation-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.name ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="consultation-email"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="consultation-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.email ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="consultation-phone"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="consultation-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.phone ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Company (Optional) */}
              <div>
                <label
                  htmlFor="consultation-company"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Company Name <span className="text-[var(--muted)]">(Optional)</span>
                </label>
                <input
                  id="consultation-company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="consultation-message"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="consultation-message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none ${errors.message ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  placeholder="Tell us about your requirements or any questions you have..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-[var(--muted)]">
                By submitting this form, you agree to our{' '}
                <a href="/privacy-policy" className="text-[var(--primary)] hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms-of-service" className="text-[var(--primary)] hover:underline">
                  Terms of Service
                </a>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
