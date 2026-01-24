'use client';

import { useReducer, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import AirVolumeCalculatorModal from './AirVolumeCalculatorModal';
import StaticPressureCalculatorModal from './StaticPressureCalculatorModal';
import ResultsBanner from './ResultsBanner';

// Mock data
const regionCountries: Record<string, string[]> = {
  Africa: [
    'Egypt',
    'Kenya',
    'Nigeria',
    'South Africa',
    'Morocco',
    'Tanzania',
    'Ghana',
  ],
  'Middle East': [
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Kuwait',
    'Bahrain',
    'Oman',
    'Jordan',
  ],
};

const countryDefaults: Record<string, { voltage: string; frequency: string }> = {
  Egypt: { voltage: '220V', frequency: '50Hz' },
  Kenya: { voltage: '240V', frequency: '50Hz' },
  Nigeria: { voltage: '230V', frequency: '50Hz' },
  'South Africa': { voltage: '230V', frequency: '50Hz' },
  Morocco: { voltage: '220V', frequency: '50Hz' },
  Tanzania: { voltage: '230V', frequency: '50Hz' },
  Ghana: { voltage: '230V', frequency: '50Hz' },
  'United Arab Emirates': { voltage: '220V', frequency: '50Hz' },
  'Saudi Arabia': { voltage: '220V', frequency: '60Hz' },
  Qatar: { voltage: '240V', frequency: '50Hz' },
  Kuwait: { voltage: '240V', frequency: '50Hz' },
  Bahrain: { voltage: '230V', frequency: '50Hz' },
  Oman: { voltage: '240V', frequency: '50Hz' },
  Jordan: { voltage: '230V', frequency: '50Hz' },
};

const categories = [
  'Cabinet Fan',
  'Ceiling Mount',
  'In-line Centrifugal Fan',
  'Industrial Fan',
  'Mini Sirocco',
  'Thermo Vent',
  'Wall Mount',
  'Window Mount',
];

const categorySubcategories: Record<string, string[]> = {
  'Cabinet Fan': ['Standard', 'Heavy Duty', 'Compact'],
  'Ceiling Mount': ['Flush Mount', 'Duct Connect', 'Decorative'],
  'In-line Centrifugal Fan': ['Low Profile', 'High Pressure', 'Mixed Flow'],
  'Industrial Fan': ['Axial', 'Centrifugal', 'Propeller'],
  'Mini Sirocco': ['Standard', 'Low Noise', 'High Flow'],
  'Thermo Vent': ['Basic', 'With Timer', 'With Humidity Sensor'],
  'Wall Mount': ['Standard', 'With Shutter', 'With Light'],
  'Window Mount': ['Reversible', 'Exhaust Only', 'With Remote'],
};

const voltageOptions = ['110V', '120V', '220V', '230V', '240V'];
const frequencyOptions = ['50Hz', '60Hz'];

const airVolumeUnits = ['CMH', 'CFM', 'L/s'];
const staticPressureUnits = ['Pa', 'mmWG', 'inWG', 'mmHg'];

// Category icons (simple SVG paths)
const categoryIcons: Record<string, string> = {
  'Cabinet Fan': 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  'Ceiling Mount': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'In-line Centrifugal Fan': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Industrial Fan': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  'Mini Sirocco': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'Thermo Vent': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  'Wall Mount': 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
  'Window Mount': 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
};

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
  | { type: 'SET_CATEGORY'; category: string };

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
      if (action.field === 'country') {
        const defaults = countryDefaults[action.value];
        if (defaults) {
          newForm.voltage = defaults.voltage;
          newForm.frequency = defaults.frequency;
        }
      }
      if (action.field === 'category') {
        newForm.subcategory = '';
      }

      return {
        ...state,
        form: newForm,
        isDirty: true,
        errors: { ...state.errors, [action.field]: undefined },
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
        // NOTE: Range validation applied to entered value regardless of unit (no conversion)
        if (num < 0 || num > 12500) {
          return 'Value must be between 0 and 12,500 CMH';
        }
      }

      // Numeric validation for static pressure
      if (field === 'staticPressure' && value) {
        const num = Number(value);
        if (isNaN(num)) {
          return 'Invalid input';
        }
        // NOTE: Range validation applied to entered value regardless of unit (no conversion)
        if (num < 0 || num > 1000) {
          return 'Value must be between 0 and 1,000 Pa';
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
    if (validateAll()) {
      // Mock search result
      const modelsFound = Math.floor(Math.random() * 50) + 5;
      dispatch({ type: 'SET_SEARCH_RESULT', result: { modelsFound } });
    }
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

  const countries = state.form.region ? regionCountries[state.form.region] || [] : [];
  const subcategories = state.form.category
    ? categorySubcategories[state.form.category] || []
    : [];

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
                    onChange={(e) => handleChange('region', e.target.value)}
                    onBlur={() => handleBlur('region')}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.region
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select region</option>
                    {Object.keys(regionCountries).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {state.errors.region && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.region}
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
                    onChange={(e) => handleChange('country', e.target.value)}
                    onBlur={() => handleBlur('country')}
                    disabled={!state.form.region}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.country
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
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
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleChange('category', cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${state.form.category === cat
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
                        d={categoryIcons[cat] || categoryIcons['Cabinet Fan']}
                      />
                    </svg>
                    <span className="hidden sm:inline">{cat}</span>
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
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${state.errors.category
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {state.errors.category && (
                    <p className="mt-1 text-xs text-[var(--error)]">
                      {state.errors.category}
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
                    disabled={!state.form.category}
                    className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${state.errors.subcategory
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                      }`}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
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
