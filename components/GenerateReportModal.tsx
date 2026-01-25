'use client';

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ReportOption {
  key: string;
  label: string;
  defaultChecked: boolean;
}

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productModelCode: string;
  onGenerate: (type: 'jpeg' | 'pdf', options: string[]) => void;
}

// ============================================================================
// Report Options
// ============================================================================

const REPORT_OPTIONS: ReportOption[] = [
  { key: 'productImage', label: 'Product Image', defaultChecked: true },
  { key: 'pqCurve', label: 'PQ Curve', defaultChecked: true },
  { key: 'featureDescription', label: 'Feature Description', defaultChecked: true },
  { key: 'dimension', label: 'Dimension', defaultChecked: true },
  { key: 'technicalData', label: 'Technical Data', defaultChecked: true },
  { key: 'accessory', label: 'Accessory', defaultChecked: true },
];

// ============================================================================
// Generate Report Modal Component
// ============================================================================

export function GenerateReportModal({
  isOpen,
  onClose,
  productModelCode,
  onGenerate,
}: GenerateReportModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    REPORT_OPTIONS.filter((opt) => opt.defaultChecked).map((opt) => opt.key)
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptionChange = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, key]);
    } else {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== key));
    }
  };

  const handleGenerate = async (type: 'jpeg' | 'pdf') => {
    setIsGenerating(true);
    try {
      await onGenerate(type, selectedOptions);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors"
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

        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
            Generate a report - <span className="text-[var(--primary)]">{productModelCode}</span>
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Please select the contents of JPEG
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Please note: all blocks will be displayed in PDF format
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {REPORT_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.key)}
                  onChange={(e) => handleOptionChange(option.key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-opacity-20"
                />
                <span className="text-sm text-[var(--foreground)]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleGenerate('jpeg')}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors disabled:opacity-50"
            disabled={isGenerating || selectedOptions.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate JPEG'}
          </button>
          <button
            type="button"
            onClick={() => handleGenerate('pdf')}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors disabled:opacity-50"
            disabled={isGenerating || selectedOptions.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Success Notification Component
// ============================================================================

interface ReportSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ReportSuccessNotification({ isVisible, onClose }: ReportSuccessNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-50 text-green-900 p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="#292E2F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <strong className="text-sm font-semibold">Success</strong>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-lg font-medium hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
      <p className="text-sm mt-2">
        A report has been successfully created and will be downloaded soon.
      </p>
    </div>
  );
}

export default GenerateReportModal;
