'use client';

import { useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { RegionResponse, CountryResponse, CategoryResponse, SubcategoryResponse } from '@/lib/db/schemas';
import {
  FilterGroup,
  CustomSelect,
  CategoryTree,
  Checkbox,
  RangeSlider,
  FilterChip,
} from './FilterComponents';

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  regionCode: string;
  countryKey: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedVoltages: string[];
  airVolumeUnit: string;
  airVolumeValue: number;
  staticPressureUnit: string;
  staticPressureValue: number;
  searchQuery: string;
}

interface FiltersProps {
  regions: RegionResponse[];
  countries: CountryResponse[];
  categories: CategoryResponse[];
  subcategories: SubcategoryResponse[];
  filters: FilterState;
  onFiltersChange: Dispatch<SetStateAction<FilterState>>;
  regionsLoading?: boolean;
  countriesLoading?: boolean;
  categoriesLoading?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ============================================================================
// Voltage Options
// ============================================================================

const VOLTAGE_OPTIONS = ['220', '230', '240', '380', '415'];

// ============================================================================
// Air Volume & Static Pressure Units
// ============================================================================

const AIR_VOLUME_UNITS = [
  { value: 'CMH', label: 'CMH' },
  { value: 'CFM', label: 'CFM' },
  { value: 'L/s', label: 'L/s' },
];

const STATIC_PRESSURE_UNITS = [
  { value: 'Pa', label: 'Pa' },
  { value: 'mmWG', label: 'mmWG' },
  { value: 'inWG', label: 'inWG' },
  { value: 'mmHg', label: 'mmHg' },
];

// ============================================================================
// Filters Panel Component
// ============================================================================

export function FiltersPanel({
  regions,
  countries,
  categories,
  subcategories,
  filters,
  onFiltersChange,
  regionsLoading = false,
  countriesLoading = false,
  categoriesLoading = false,
  isMobileOpen = false,
  onMobileClose,
}: FiltersProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isLocationSelected = Boolean(filters.regionCode && filters.countryKey);

  // Calculate applied filters count
  const appliedFiltersCount =
    (filters.regionCode ? 1 : 0) +
    (filters.countryKey ? 1 : 0) +
    filters.selectedCategories.length +
    filters.selectedSubcategories.length +
    filters.selectedVoltages.length +
    (filters.airVolumeValue > 0 ? 1 : 0) +
    (filters.staticPressureValue > 0 ? 1 : 0);

  // Get filter labels for chips
  const getAppliedFilters = () => {
    const applied: { key: string; label: string }[] = [];

    if (filters.regionCode) {
      const region = regions.find((r) => r.code === filters.regionCode);
      if (region) {
        applied.push({ key: 'region', label: region.name });
      }
    }

    if (filters.countryKey) {
      const country = countries.find((c) => c.iso2 === filters.countryKey);
      if (country) {
        applied.push({ key: 'country', label: country.name });
      }
    }

    filters.selectedCategories.forEach((code) => {
      const category = categories.find((c) => c.code === code);
      if (category) {
        applied.push({ key: `category-${code}`, label: category.name });
      }
    });

    filters.selectedSubcategories.forEach((code) => {
      const subcategory = subcategories.find((s) => s.code === code);
      if (subcategory) {
        applied.push({ key: `subcategory-${code}`, label: subcategory.name });
      }
    });

    filters.selectedVoltages.forEach((v) => {
      applied.push({ key: `voltage-${v}`, label: `${v} V` });
    });

    if (filters.airVolumeValue > 0) {
      applied.push({
        key: 'airVolume',
        label: `Air: ${filters.airVolumeValue} ${filters.airVolumeUnit || 'CMH'}`,
      });
    }

    if (filters.staticPressureValue > 0) {
      applied.push({
        key: 'staticPressure',
        label: `Pressure: ${filters.staticPressureValue} ${filters.staticPressureUnit || 'Pa'}`,
      });
    }

    return applied;
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };

    if (key === 'region') {
      newFilters.regionCode = '';
      newFilters.countryKey = '';
    } else if (key === 'country') {
      newFilters.countryKey = '';
    } else if (key.startsWith('category-')) {
      const code = key.replace('category-', '');
      newFilters.selectedCategories = filters.selectedCategories.filter((c) => c !== code);
      // Also remove subcategories of this category
      const categorySubcodes = subcategories
        .filter((s) => s.categoryCode === code)
        .map((s) => s.code);
      newFilters.selectedSubcategories = filters.selectedSubcategories.filter(
        (s) => !categorySubcodes.includes(s)
      );
    } else if (key.startsWith('subcategory-')) {
      const code = key.replace('subcategory-', '');
      newFilters.selectedSubcategories = filters.selectedSubcategories.filter((s) => s !== code);
    } else if (key.startsWith('voltage-')) {
      const voltage = key.replace('voltage-', '');
      newFilters.selectedVoltages = filters.selectedVoltages.filter((v) => v !== voltage);
    } else if (key === 'airVolume') {
      newFilters.airVolumeValue = 0;
    } else if (key === 'staticPressure') {
      newFilters.staticPressureValue = 0;
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({
      regionCode: '',
      countryKey: '',
      selectedCategories: [],
      selectedSubcategories: [],
      selectedVoltages: [],
      airVolumeUnit: 'CMH',
      airVolumeValue: 0,
      staticPressureUnit: 'Pa',
      staticPressureValue: 0,
      searchQuery: '',
    });
  };

  // Close mobile panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, onMobileClose]);

  const filterContent = (
    <div ref={panelRef} className="bg-white h-full overflow-y-auto">
      {/* Mobile Header */}
      {isMobileOpen && (
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] lg:hidden">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Filters</h3>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#6D7B7D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Applied Filters */}
      {appliedFiltersCount > 0 && (
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              FILTERS APPLIED ({appliedFiltersCount})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Clear all ×
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAppliedFilters().map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                onRemove={() => handleRemoveFilter(filter.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Location Filter */}
      <FilterGroup title="Location" defaultOpen>
        <CustomSelect
          label="Region"
          options={regions.map((r) => ({ value: r.code, label: r.name }))}
          value={filters.regionCode}
          onChange={(value) =>
            onFiltersChange({ ...filters, regionCode: value, countryKey: '' })
          }
          placeholder="Select Region"
          loading={regionsLoading}
        />
        <CustomSelect
          label="Country"
          options={countries.map((c) => ({ value: c.iso2, label: c.name }))}
          value={filters.countryKey}
          onChange={(value) => onFiltersChange({ ...filters, countryKey: value })}
          placeholder="Select Country"
          disabled={!filters.regionCode}
          loading={countriesLoading}
        />
      </FilterGroup>

      {/* Category & Subcategory Filter */}
      <FilterGroup title="Category & Subcategory" defaultOpen>
        <div
          className={isLocationSelected ? '' : 'opacity-50 pointer-events-none'}
          aria-disabled={!isLocationSelected}
        >
          {categoriesLoading ? (
            <div className="py-4 text-sm text-[var(--muted)]">Loading categories...</div>
          ) : (
            <CategoryTree
              categories={categories}
              subcategories={subcategories}
              selectedCategories={filters.selectedCategories}
              selectedSubcategories={filters.selectedSubcategories}
              onCategoryChange={(codes) =>
                onFiltersChange((prev) => ({ ...prev, selectedCategories: codes }))
              }
              onSubcategoryChange={(codes) =>
                onFiltersChange((prev) => ({ ...prev, selectedSubcategories: codes }))
              }
            />
          )}
        </div>
      </FilterGroup>

      {/* Voltage Filter */}
      <FilterGroup title="Voltage" defaultOpen>
        <div
          className={isLocationSelected ? 'space-y-1' : 'space-y-1 opacity-50 pointer-events-none'}
          aria-disabled={!isLocationSelected}
        >
          {VOLTAGE_OPTIONS.map((voltage) => (
            <Checkbox
              key={voltage}
              label={`${voltage} V`}
              checked={filters.selectedVoltages.includes(voltage)}
              onChange={(checked) => {
                const newVoltages = checked
                  ? [...filters.selectedVoltages, voltage]
                  : filters.selectedVoltages.filter((v) => v !== voltage);
                onFiltersChange({ ...filters, selectedVoltages: newVoltages });
              }}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Air Volume Filter */}
      <FilterGroup title="Air Volume" defaultOpen>
        <div
          className={isLocationSelected ? '' : 'opacity-50 pointer-events-none'}
          aria-disabled={!isLocationSelected}
        >
          <CustomSelect
            label="Size Unit"
            options={AIR_VOLUME_UNITS}
            value={filters.airVolumeUnit}
            onChange={(value) => onFiltersChange({ ...filters, airVolumeUnit: value })}
            placeholder="Select Unit"
          />
          <RangeSlider
            label="Value"
            min={0}
            max={10000}
            value={filters.airVolumeValue}
            onChange={(value) => onFiltersChange({ ...filters, airVolumeValue: value })}
            unit={filters.airVolumeUnit || 'CMH'}
          />
        </div>
      </FilterGroup>

      {/* Static Pressure Filter */}
      <FilterGroup title="Static Pressure" defaultOpen>
        <div
          className={isLocationSelected ? '' : 'opacity-50 pointer-events-none'}
          aria-disabled={!isLocationSelected}
        >
          <CustomSelect
            label="Size Unit"
            options={STATIC_PRESSURE_UNITS}
            value={filters.staticPressureUnit}
            onChange={(value) => onFiltersChange({ ...filters, staticPressureUnit: value })}
            placeholder="Select Unit"
          />
          <RangeSlider
            label="Value"
            min={0}
            max={1000}
            value={filters.staticPressureValue}
            onChange={(value) => onFiltersChange({ ...filters, staticPressureValue: value })}
            unit={filters.staticPressureUnit || 'Pa'}
          />
        </div>
      </FilterGroup>
    </div>
  );

  // Desktop view
  if (!isMobileOpen) {
    return (
      <div className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-20 border border-[var(--border)] rounded-lg overflow-hidden">
          {filterContent}
        </div>
      </div>
    );
  }

  // Mobile view (overlay)
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
      <div className="absolute inset-y-0 left-0 w-full max-w-[320px] bg-white shadow-xl">
        {filterContent}
      </div>
    </div>
  );
}

export default FiltersPanel;
