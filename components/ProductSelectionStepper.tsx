'use client';

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from './ConfirmModal';
import AirVolumeCalculatorModal from './AirVolumeCalculatorModal';
import StaticPressureCalculatorModal from './StaticPressureCalculatorModal';
import ResultsBanner from './ResultsBanner';
import { useRegions, useCountriesByRegion } from '@/hooks/useRegionsAndCountries';
import { useCategories, useSubcategoriesByCategory } from '@/hooks/useCategoriesAndSubcategories';
import type { CountryResponse } from '@/lib/db/schemas';

const voltageOptions = ['110V', '120V', '220V', '230V', '240V'];
const frequencyOptions = ['50Hz', '60Hz'];

const airVolumeUnits = ['CMH', 'CFM', 'L/s'];
const staticPressureUnits = ['Pa', 'mmWG', 'inWG', 'mmHg'];

const airVolumeToCmh = (value: number, unit: string) => {
  if (unit === 'CFM') {
    return value * 1.69901082;
  }
  if (unit === 'L/s') {
    return value * 3.6;
  }
  return value;
};

const cmhToAirVolumeUnit = (value: number, unit: string) => {
  if (unit === 'CFM') {
    return value / 1.69901082;
  }
  if (unit === 'L/s') {
    return value / 3.6;
  }
  return value;
};

const staticPressureToPa = (value: number, unit: string) => {
  if (unit === 'mmWG') {
    return value * 9.80665;
  }
  if (unit === 'inWG') {
    return value * 249.0889;
  }
  if (unit === 'mmHg') {
    return value * 133.322;
  }
  return value;
};

const paToStaticPressureUnit = (value: number, unit: string) => {
  if (unit === 'mmWG') {
    return value / 9.80665;
  }
  if (unit === 'inWG') {
    return value / 249.0889;
  }
  if (unit === 'mmHg') {
    return value / 133.322;
  }
  return value;
};

const formatRangeValue = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString();
  }
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Default icon for categories without a custom icon
const defaultCategoryIcon = 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';

// State types
interface FormState {
  region: string;
  country: string;
  category: string;
  subcategory: string;
  voltage: string;
  frequency: string;
  airVolume: string;
  airVolumeUnit: string;
  staticPressure: string;
  staticPressureUnit: string;
}

interface FormErrors {
  region?: string;
  country?: string;
  category?: string;
  subcategory?: string;
  voltage?: string;
  frequency?: string;
  airVolume?: string;
  staticPressure?: string;
}

interface ModalState {
  clearConfirm: boolean;
  leaveConfirm: boolean;
  airVolumeCalc: boolean;
  staticPressureCalc: boolean;
}

interface State {
  form: FormState;
  errors: FormErrors;
  modals: ModalState;
  isDirty: boolean;
  searchResult: { modelsFound: number } | null;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SET_ERROR'; field: keyof FormErrors; value: string | undefined }
  | { type: 'SET_ERRORS'; errors: FormErrors }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'TOGGLE_MODAL'; modal: keyof ModalState; value: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SEARCH_RESULT'; result: { modelsFound: number } | null }
  | { type: 'SET_DIRTY'; value: boolean }
  | { type: 'APPLY_AIR_VOLUME'; value: number; unit: string }
  | { type: 'APPLY_STATIC_PRESSURE'; value: number; unit: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_COUNTRY_WITH_DEFAULTS'; country: string; voltage: string; frequency: string }
  | { type: 'SET_REGION'; regionCode: string };

const initialState: State = {
  form: {
    region: '',
    country: '',
    category: '',
    subcategory: '',
    voltage: '',
    frequency: '',
    airVolume: '',
    airVolumeUnit: 'CMH',
    staticPressure: '',
    staticPressureUnit: 'Pa',
  },
  errors: {},
  modals: {
    clearConfirm: false,
    leaveConfirm: false,
    airVolumeCalc: false,
    staticPressureCalc: false,
  },
  isDirty: false,
  searchResult: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD': {
      const newForm = { ...state.form, [action.field]: action.value };

      // Handle dependent fields
      if (action.field === 'region') {
        newForm.country = '';
        newForm.voltage = '';
        newForm.frequency = '';
      }
      // Note: country defaults are now handled in the component via SET_COUNTRY_WITH_DEFAULTS
      if (action.field === 'category') {
        newForm.subcategory = '';
      }

      const nextErrors = { ...state.errors, [action.field]: undefined };
      if (action.field === 'airVolumeUnit') {
        nextErrors.airVolume = undefined;
      }
      if (action.field === 'staticPressureUnit') {
        nextErrors.staticPressure = undefined;
      }

      return {
        ...state,
        form: newForm,
        isDirty: true,
        errors: nextErrors,
        searchResult: null,
      };
    }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.value },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: action.value },
      };
    case 'RESET_FORM':
      return { ...initialState };
    case 'SET_SEARCH_RESULT':
      return { ...state, searchResult: action.result };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.value };
    case 'APPLY_AIR_VOLUME':
      return {
        ...state,
        form: {
          ...state.form,
          airVolume: String(action.value),
          airVolumeUnit: action.unit,
        },
        errors: { ...state.errors, airVolume: undefined },
        isDirty: true,
        searchResult: null,
      };
    case 'APPLY_STATIC_PRESSURE':
      return {
        ...state,
        form: {
          ...state.form,
          staticPressure: String(action.value),
          staticPressureUnit: action.unit,
        },
        errors: { ...state.errors, staticPressure: undefined },
        isDirty: true,
        searchResult: null,
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        form: {
          ...state.form,
          category: action.category,
          subcategory: '',
        },
        isDirty: true,
        errors: { ...state.errors, category: undefined },
        searchResult: null,
      };
    case 'SET_COUNTRY_WITH_DEFAULTS':
      return {
        ...state,
        form: {
          ...state.form,
          country: action.country,
          voltage: action.voltage,
          frequency: action.frequency,
        },
        isDirty: true,
        errors: { ...state.errors, country: undefined },
        searchResult: null,
      };
    case 'SET_REGION':
      return {
        ...state,
        form: {
          ...state.form,
          region: action.regionCode,
          country: '',
          voltage: '',
          frequency: '',
        },
        isDirty: true,
        errors: { ...state.errors, region: undefined },
        searchResult: null,
      };
    default:
      return state;
  }
}

interface ProductSelectionStepperProps {
  preselectedCategory?: string;
  onCategoryPreselected?: () => void;
}

export default function ProductSelectionStepper({
  preselectedCategory,
  onCategoryPreselected,
}: ProductSelectionStepperProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  // Fetch regions and countries from API
  const { regions, loading: regionsLoading, error: regionsError } = useRegions();

  // Get the selected region's code for fetching countries
  const selectedRegionCode = useMemo(() => {
    const region = regions.find((r) => r.name === state.form.region);
    return region?.code || null;
  }, [regions, state.form.region]);

  const { countries: countriesData, loading: countriesLoading } = useCountriesByRegion(selectedRegionCode);

  // Build a lookup map for country defaults (voltage/frequency)
  const countryDefaultsMap = useMemo(() => {
    const map: Record<string, CountryResponse> = {};
    countriesData.forEach((country) => {
      map[country.name] = country;
    });
    return map;
  }, [countriesData]);

  // Fetch categories and subcategories from API
  const { categories: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Get the selected category's code for fetching subcategories
  const selectedCategoryCode = useMemo(() => {
    const category = categoriesData.find((c) => c.name === state.form.category);
    return category?.code || null;
  }, [categoriesData, state.form.category]);

  const { subcategories: subcategoriesData, loading: subcategoriesLoading } = useSubcategoriesByCategory(selectedCategoryCode);

  // Handle preselected category from CategoryTiles
  useEffect(() => {
    if (preselectedCategory) {
      dispatch({ type: 'SET_CATEGORY', category: preselectedCategory });
      onCategoryPreselected?.();
    }
  }, [preselectedCategory, onCategoryPreselected]);

  // Beforeunload handler for dirty state
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty]);

  const validateField = useCallback(
    (field: keyof FormState): string | undefined => {
      const value = state.form[field];

      // Required field validation
      const requiredFields: (keyof FormState)[] = [
        'region',
        'country',
        'category',
        'subcategory',
        'voltage',
        'frequency',
        'airVolume',
        'staticPressure',
      ];

      if (requiredFields.includes(field) && !value) {
        return 'Selection is required';
      }

      // Numeric validation for air volume
      if (field === 'airVolume' && value) {
        const num = Number(value);
        if (isNaN(num)) {
          return 'Invalid input';
        }
        const airVolumeCmh = airVolumeToCmh(num, state.form.airVolumeUnit);
        if (airVolumeCmh < 0 || airVolumeCmh > 12500) {
          const maxValue = cmhToAirVolumeUnit(12500, state.form.airVolumeUnit);
          return `Value must be between 0 and ${formatRangeValue(maxValue)} ${state.form.airVolumeUnit}`;
        }
      }

      // Numeric validation for static pressure
      if (field === 'staticPressure' && value) {
        const num = Number(value);
        if (isNaN(num)) {
          return 'Invalid input';
        }
        const pressurePa = staticPressureToPa(num, state.form.staticPressureUnit);
        if (pressurePa < 0 || pressurePa > 1000) {
          const maxValue = paToStaticPressureUnit(1000, state.form.staticPressureUnit);
          return `Value must be between 0 and ${formatRangeValue(maxValue)} ${state.form.staticPressureUnit}`;
        }
      }

      return undefined;
    },
    [state.form]
  );

  const handleBlur = (field: keyof FormState) => {
    const error = validateField(field);
    dispatch({ type: 'SET_ERROR', field: field as keyof FormErrors, value: error });
  };

  const handleChange = (field: keyof FormState, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  // Handle region change - store the region name but clear country and defaults
  const handleRegionChange = (regionName: string) => {
    dispatch({ type: 'SET_FIELD', field: 'region', value: regionName });
  };

  // Handle country change with voltage/frequency defaults from DB
  const handleCountryChange = (countryName: string) => {
    const countryData = countryDefaultsMap[countryName];
    if (countryData) {
      dispatch({
        type: 'SET_COUNTRY_WITH_DEFAULTS',
        country: countryName,
        voltage: countryData.voltage,
        frequency: countryData.frequency,
      });
    } else {
      dispatch({ type: 'SET_FIELD', field: 'country', value: countryName });
    }
  };

  const validateAll = (): boolean => {
    const errors: FormErrors = {};
    const fieldsToValidate: (keyof FormState)[] = [
      'region',
      'country',
      'category',
      'subcategory',
      'voltage',
      'frequency',
      'airVolume',
      'staticPressure',
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field);
      if (error) {
        errors[field as keyof FormErrors] = error;
      }
    });

    dispatch({ type: 'SET_ERRORS', errors });
    return Object.keys(errors).length === 0;
  };

  const handleSearch = () => {
    if (!validateAll()) return;

    const region = regions.find((r) => r.name === state.form.region);
    const country = countriesData.find((c) => c.name === state.form.country);
    const category = categoriesData.find((c) => c.name === state.form.category);
    const subcategory = subcategoriesData.find((s) => s.name === state.form.subcategory);

    const params = new URLSearchParams();
    if (region?.code) params.set('regionCode', region.code);
    if (country?.iso2) params.set('countryKey', country.iso2);
    if (category?.code) params.set('categoryCode', category.code);
    if (subcategory?.code) params.set('subcategoryCode', subcategory.code);

    const voltage = state.form.voltage.trim();
    if (voltage) {
      const normalizedVoltage = voltage.replace(/[^0-9]/g, '');
      if (normalizedVoltage) {
        params.set('voltage', normalizedVoltage);
      }
    }

    const airVolumeValue = Number(state.form.airVolume);
    if (!Number.isNaN(airVolumeValue) && airVolumeValue > 0) {
      params.set('airVolumeValue', String(airVolumeValue));
      params.set('airVolumeUnit', state.form.airVolumeUnit || 'CMH');
    }

    const staticPressureValue = Number(state.form.staticPressure);
    if (!Number.isNaN(staticPressureValue) && staticPressureValue > 0) {
      params.set('staticPressureValue', String(staticPressureValue));
      params.set('staticPressureUnit', state.form.staticPressureUnit || 'Pa');
    }

    const queryString = params.toString();
    router.push(queryString ? `/product-lists?${queryString}` : '/product-lists');
  };

  const handleClearForm = () => {
    dispatch({ type: 'TOGGLE_MODAL', modal: 'clearConfirm', value: true });
  };

  const confirmClear = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const handleLeavePage = () => {
    dispatch({ type: 'TOGGLE_MODAL', modal: 'leaveConfirm', value: true });
  };

  const confirmLeave = () => {
    dispatch({ type: 'RESET_FORM' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyAirVolume = (value: number, unit: string) => {
    dispatch({ type: 'APPLY_AIR_VOLUME', value, unit });
  };

  const handleApplyStaticPressure = (value: number, unit: string) => {
    dispatch({ type: 'APPLY_STATIC_PRESSURE', value, unit });
  };

  // Countries list derived from API data
  const countryNames = countriesData.map((c) => c.name);

  // Categories and subcategories lists derived from API data
  const categoryNames = categoriesData.map((c) => c.name);
  const subcategoryNames = subcategoriesData.map((s) => s.name);

  return (
    <section id="product-selection" className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-8">
          Product Selection
        </h2>

        <div className="bg-white border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Step 1 */}
          <div className="flex gap-4 sm:gap-6 pb-8 border-b border-[var(--border)]">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-4">
                Select Region and Country
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Region <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="region"
                    value={state.form.region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    onBlur={() => handleBlur('region')}
                    disabled={regionsLoading}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.region
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">{regionsLoading ? 'Loading...' : 'Select region'}</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {state.errors.region && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.region}
                    </p>
                  )}
                  {regionsError && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      Failed to load regions
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Country <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="country"
                    value={state.form.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    onBlur={() => handleBlur('country')}
                    disabled={!state.form.region || countriesLoading}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.country
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">{countriesLoading ? 'Loading...' : 'Select country'}</option>
                    {countryNames.map((countryName) => (
                      <option key={countryName} value={countryName}>
                        {countryName}
                      </option>
                    ))}
                  </select>
                  {state.errors.country && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            id="step-category"
            className="flex gap-4 sm:gap-6 py-8 border-b border-[var(--border)]"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-4">
                Select Category
              </h3>

              {/* Category icons preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categoriesData.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleChange('category', cat.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${state.form.category === cat.name
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]'
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={cat.icon || defaultCategoryIcon}
                      />
                    </svg>
                    <span className="hidden sm:inline">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Category <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="category"
                    value={state.form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    onBlur={() => handleBlur('category')}
                    disabled={categoriesLoading}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.category
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">{categoriesLoading ? 'Loading...' : 'Select category'}</option>
                    {categoryNames.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                  {state.errors.category && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.category}
                    </p>
                  )}
                  {categoriesError && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      Failed to load categories
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Subcategory <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="subcategory"
                    value={state.form.subcategory}
                    onChange={(e) => handleChange('subcategory', e.target.value)}
                    onBlur={() => handleBlur('subcategory')}
                    disabled={!state.form.category || subcategoriesLoading}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.subcategory
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">{subcategoriesLoading ? 'Loading...' : 'Select subcategory'}</option>
                    {subcategoryNames.map((subName) => (
                      <option key={subName} value={subName}>
                        {subName}
                      </option>
                    ))}
                  </select>
                  {state.errors.subcategory && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.subcategory}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 sm:gap-6 py-8 border-b border-[var(--border)]">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2">
                Select Voltage and Frequency
              </h3>
              <p className="text-xs text-[var(--muted)] mb-4">
                These fields are automatically updated based on your selected country.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="voltage"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Voltage <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="voltage"
                    value={state.form.voltage}
                    onChange={(e) => handleChange('voltage', e.target.value)}
                    onBlur={() => handleBlur('voltage')}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.voltage
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select voltage</option>
                    {voltageOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {state.errors.voltage && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.voltage}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="frequency"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1"
                  >
                    Frequency <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="frequency"
                    value={state.form.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    onBlur={() => handleBlur('frequency')}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.frequency
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select frequency</option>
                    {frequencyOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {state.errors.frequency && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.frequency}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 sm:gap-6 pt-8">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                4
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-4">
                Enter Air Volume and Static Pressure
              </h3>
              <div className="space-y-6">
                {/* Air Volume */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="airVolume"
                      className="text-sm font-medium text-[var(--foreground)]"
                    >
                      Air Volume <span className="text-[var(--error)]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_MODAL',
                          modal: 'airVolumeCalc',
                          value: true,
                        })
                      }
                      className="text-xs text-[var(--primary)] hover:underline font-medium"
                    >
                      Calculate Required Air Volume
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="airVolume"
                      type="text"
                      inputMode="decimal"
                      value={state.form.airVolume}
                      onChange={(e) => handleChange('airVolume', e.target.value)}
                      onBlur={() => handleBlur('airVolume')}
                      placeholder="Enter air volume"
                      className={`flex-1 h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.airVolume
                        ? 'border-[var(--error)]'
                        : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                        }`}
                    />
                    <select
                      id="airVolumeUnit"
                      value={state.form.airVolumeUnit}
                      onChange={(e) =>
                        handleChange('airVolumeUnit', e.target.value)
                      }
                      className="w-24 h-11 px-2 border border-[var(--border)] rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {airVolumeUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {state.errors.airVolume && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.airVolume}
                    </p>
                  )}
                </div>

                {/* Static Pressure */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="staticPressure"
                      className="text-sm font-medium text-[var(--foreground)]"
                    >
                      Static Pressure <span className="text-[var(--error)]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_MODAL',
                          modal: 'staticPressureCalc',
                          value: true,
                        })
                      }
                      className="text-xs text-[var(--primary)] hover:underline font-medium"
                    >
                      Calculate Static Pressure
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="staticPressure"
                      type="text"
                      inputMode="decimal"
                      value={state.form.staticPressure}
                      onChange={(e) =>
                        handleChange('staticPressure', e.target.value)
                      }
                      onBlur={() => handleBlur('staticPressure')}
                      placeholder="Enter static pressure"
                      className={`flex-1 h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.staticPressure
                        ? 'border-[var(--error)]'
                        : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                        }`}
                    />
                    <select
                      id="staticPressureUnit"
                      value={state.form.staticPressureUnit}
                      onChange={(e) =>
                        handleChange('staticPressureUnit', e.target.value)
                      }
                      className="w-24 h-11 px-2 border border-[var(--border)] rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {staticPressureUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {state.errors.staticPressure && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.staticPressure}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-[var(--border)]">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleClearForm}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
              >
                Clear form
              </button>
              {state.isDirty && (
                <button
                  type="button"
                  onClick={handleLeavePage}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
                >
                  Leave page
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Search models
            </button>
          </div>

          {/* Results Banner */}
          {state.searchResult && (
            <ResultsBanner
              modelsFound={state.searchResult.modelsFound}
              onClose={() =>
                dispatch({ type: 'SET_SEARCH_RESULT', result: null })
              }
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={state.modals.clearConfirm}
        onClose={() =>
          dispatch({ type: 'TOGGLE_MODAL', modal: 'clearConfirm', value: false })
        }
        onConfirm={confirmClear}
        title="Are you sure you want to clear the form?"
        message="All data will be lost"
      />

      <ConfirmModal
        isOpen={state.modals.leaveConfirm}
        onClose={() =>
          dispatch({ type: 'TOGGLE_MODAL', modal: 'leaveConfirm', value: false })
        }
        onConfirm={confirmLeave}
        title="Are you sure you want to close the window?"
        message="All data will be lost"
      />

      <AirVolumeCalculatorModal
        isOpen={state.modals.airVolumeCalc}
        onClose={() =>
          dispatch({ type: 'TOGGLE_MODAL', modal: 'airVolumeCalc', value: false })
        }
        onApply={handleApplyAirVolume}
      />

      <StaticPressureCalculatorModal
        isOpen={state.modals.staticPressureCalc}
        onClose={() =>
          dispatch({
            type: 'TOGGLE_MODAL',
            modal: 'staticPressureCalc',
            value: false,
          })
        }
        onApply={handleApplyStaticPressure}
        initialAirVolume={state.form.airVolume}
        initialAirVolumeUnit={state.form.airVolumeUnit}
      />
    </section>
  );
}
