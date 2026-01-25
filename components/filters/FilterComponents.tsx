'use client';

import { useState } from 'react';

// ============================================================================
// Chevron Icon Component
// ============================================================================

interface ChevronIconProps {
  rotated?: boolean;
  className?: string;
}

export function ChevronIcon({ rotated = false, className = '' }: ChevronIconProps) {
  return (
    <svg
      className={`transition-transform duration-200 ${rotated ? 'rotate-180' : ''} ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#808080"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Collapsible Filter Group
// ============================================================================

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FilterGroup({ title, children, defaultOpen = true }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border)]">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
          {title}
        </span>
        <ChevronIcon rotated={isOpen} />
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ============================================================================
// Custom Select Component
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  wrapperClassName?: string;
  overlayZIndexClass?: string;
  menuZIndexClass?: string;
}

export function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  loading = false,
  wrapperClassName = 'mb-4',
  overlayZIndexClass = 'z-10',
  menuZIndexClass = 'z-20',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={wrapperClassName}>
      <label className="block text-sm text-[var(--muted)] mb-1.5">{label}</label>
      <div className="relative">
        <button
          type="button"
          className={`w-full flex items-center justify-between px-3 py-2.5 border border-[var(--border)] rounded-lg bg-white text-left text-sm transition-colors ${disabled || loading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20'
            }`}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          disabled={disabled || loading}
        >
          <span className={selectedOption ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}>
            {loading ? 'Loading...' : selectedOption?.label || placeholder}
          </span>
          <ChevronIcon rotated={isOpen} className="ml-2 flex-shrink-0" />
        </button>

        {isOpen && !disabled && !loading && (
          <>
            <div className={`fixed inset-0 ${overlayZIndexClass}`} onClick={() => setIsOpen(false)} />
            <ul className={`absolute ${menuZIndexClass} w-full mt-1 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-auto`}>
              {options.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--muted)]">No options available</li>
              ) : (
                options.map((option) => (
                  <li
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${option.value === value
                      ? 'bg-gray-100 text-[var(--primary)] font-medium'
                      : 'text-[var(--foreground)]'
                      }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    {option.label}
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Checkbox Component
// ============================================================================

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

export function Checkbox({ label, checked, onChange, indeterminate = false }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-opacity-20"
      />
      <span className="text-sm text-[var(--foreground)]">{label}</span>
    </label>
  );
}

// ============================================================================
// Category Tree Component
// ============================================================================

interface Subcategory {
  code: string;
  name: string;
  categoryCode: string;
}

interface Category {
  code: string;
  name: string;
}

interface CategoryTreeProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (codes: string[]) => void;
  onSubcategoryChange: (codes: string[]) => void;
}

export function CategoryTree({
  categories,
  subcategories,
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (code: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryCheck = (code: string, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, code]);
    } else {
      onCategoryChange(selectedCategories.filter((c) => c !== code));
      // Also uncheck all subcategories of this category
      const categorySubcodes = subcategories
        .filter((s) => s.categoryCode === code)
        .map((s) => s.code);
      onSubcategoryChange(selectedSubcategories.filter((s) => !categorySubcodes.includes(s)));
    }
  };

  const handleSubcategoryCheck = (code: string, checked: boolean) => {
    if (checked) {
      onSubcategoryChange([...selectedSubcategories, code]);
    } else {
      onSubcategoryChange(selectedSubcategories.filter((s) => s !== code));
    }
  };

  return (
    <ul className="space-y-1">
      {categories.map((category) => {
        const categorySubcategories = subcategories.filter((s) => s.categoryCode === category.code);
        const hasSubcategories = categorySubcategories.length > 0;
        const isExpanded = expandedCategories.has(category.code);
        const isCategoryChecked = selectedCategories.includes(category.code);
        const checkedSubcategoriesCount = categorySubcategories.filter((s) =>
          selectedSubcategories.includes(s.code)
        ).length;
        const isIndeterminate =
          checkedSubcategoriesCount > 0 &&
          checkedSubcategoriesCount < categorySubcategories.length &&
          !isCategoryChecked;

        return (
          <li key={category.code}>
            <div className="flex items-center">
              <Checkbox
                label={category.name}
                checked={isCategoryChecked}
                onChange={(checked) => handleCategoryCheck(category.code, checked)}
                indeterminate={isIndeterminate}
              />
              {hasSubcategories && (
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 rounded transition-colors ml-auto"
                  onClick={() => toggleCategory(category.code)}
                >
                  <ChevronIcon rotated={isExpanded} className="w-5 h-5" />
                </button>
              )}
            </div>
            {hasSubcategories && isExpanded && (
              <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
                {categorySubcategories.map((subcategory) => (
                  <li key={subcategory.code}>
                    <Checkbox
                      label={subcategory.name}
                      checked={selectedSubcategories.includes(subcategory.code)}
                      onChange={(checked) => handleSubcategoryCheck(subcategory.code, checked)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================================
// Range Slider Component
// ============================================================================

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit: string;
}

export function RangeSlider({ label, min, max, value, onChange, unit }: RangeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-[var(--muted)]">{label}</label>
        <span className="text-sm font-medium text-[var(--foreground)]">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
      />
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>Min</span>
        <span>Max</span>
      </div>
    </div>
  );
}

// ============================================================================
// Applied Filter Chip
// ============================================================================

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-[var(--foreground)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3L3 9M3 3L9 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </span>
  );
}
