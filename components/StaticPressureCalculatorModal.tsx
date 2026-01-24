'use client';

import { useState } from 'react';
import Modal from './Modal';

interface StaticPressureCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number, unit: string) => void;
  initialAirVolume?: string;
}

const ductMaterials = ['Aluminium Flex', 'Steel', 'Vinyl'];
const diameterOptions = [
  '100mm (4 in.)',
  '150mm (6 in.)',
  '200mm (8 in.)',
  '250mm (10 in.)',
  '300mm (12 in.)',
];
const wallCapTypes = [
  'Standard Louver',
  'Weather Hood',
  'Dryer Vent Cap',
  'Backdraft Damper',
  'Flush Mount Cap',
];

// Friction factors by material (simplified)
const materialFrictionFactors: Record<string, number> = {
  'Aluminium Flex': 0.03,
  Steel: 0.015,
  Vinyl: 0.025,
};

// Diameter to mm mapping
const diameterMm: Record<string, number> = {
  '100mm (4 in.)': 100,
  '150mm (6 in.)': 150,
  '200mm (8 in.)': 200,
  '250mm (10 in.)': 250,
  '300mm (12 in.)': 300,
};

interface FormState {
  airVolume: string;
  material: string;
  ductLength: string;
  ductLengthUnit: string;
  diameter: string;
  hasElbow: boolean;
  elbowCount: number;
  elbowRadius: string;
  hasCapLouver: boolean;
  wallCapType: string;
}

interface FormErrors {
  airVolume?: string;
  material?: string;
  ductLength?: string;
  diameter?: string;
  elbowRadius?: string;
  wallCapType?: string;
}

const getInitialFormState = (airVolume: string = ''): FormState => ({
  airVolume,
  material: '',
  ductLength: '',
  ductLengthUnit: 'm',
  diameter: '',
  hasElbow: false,
  elbowCount: 1,
  elbowRadius: '',
  hasCapLouver: false,
  wallCapType: '',
});

export default function StaticPressureCalculatorModal({
  isOpen,
  onClose,
  onApply,
  initialAirVolume = '',
}: StaticPressureCalculatorModalProps) {
  // Use the initialAirVolume in the initial state
  const [form, setForm] = useState<FormState>(() => getInitialFormState(initialAirVolume));
  const [errors, setErrors] = useState<FormErrors>({});
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [lastOpenState, setLastOpenState] = useState(false);

  // When modal opens and there's an initial air volume, update the form
  // This is a controlled update based on state comparison
  if (isOpen && !lastOpenState && initialAirVolume) {
    // Schedule the state update after render
    setLastOpenState(true);
    // Also set the air volume - React 19 allows this pattern when done carefully
    if (form.airVolume !== initialAirVolume) {
      setForm((prev) => ({ ...prev, airVolume: initialAirVolume }));
    }
  } else if (!isOpen && lastOpenState) {
    setLastOpenState(false);
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.airVolume) {
      newErrors.airVolume = 'Air volume is required';
    } else if (isNaN(Number(form.airVolume)) || Number(form.airVolume) <= 0) {
      newErrors.airVolume = 'Invalid input';
    }

    if (!form.material) {
      newErrors.material = 'Selection is required';
    }

    if (!form.ductLength) {
      newErrors.ductLength = 'Duct length is required';
    } else if (isNaN(Number(form.ductLength)) || Number(form.ductLength) <= 0) {
      newErrors.ductLength = 'Invalid input';
    }

    if (!form.diameter) {
      newErrors.diameter = 'Selection is required';
    }

    if (form.hasElbow && !form.elbowRadius) {
      newErrors.elbowRadius = 'Elbow radius is required';
    } else if (
      form.hasElbow &&
      (isNaN(Number(form.elbowRadius)) || Number(form.elbowRadius) <= 0)
    ) {
      newErrors.elbowRadius = 'Invalid input';
    }

    if (form.hasCapLouver && !form.wallCapType) {
      newErrors.wallCapType = 'Selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    // Convert duct length to meters
    let ductLengthM = Number(form.ductLength);
    if (form.ductLengthUnit === 'mm') {
      ductLengthM /= 1000;
    } else if (form.ductLengthUnit === 'cm') {
      ductLengthM /= 100;
    }

    // Get diameter in meters
    const diameterM = (diameterMm[form.diameter] || 150) / 1000;

    // Get friction factor
    const frictionFactor = materialFrictionFactors[form.material] || 0.02;

    // Air volume in m³/s (convert from CMH)
    const airVolumeM3s = Number(form.airVolume) / 3600;

    // Calculate velocity (m/s)
    const area = Math.PI * Math.pow(diameterM / 2, 2);
    const velocity = airVolumeM3s / area;

    // Simplified pressure drop calculation using Darcy-Weisbach equation
    // ΔP = f * (L/D) * (ρ * v²/2)
    const airDensity = 1.2; // kg/m³
    let pressureDrop =
      frictionFactor *
      (ductLengthM / diameterM) *
      (airDensity * Math.pow(velocity, 2)) /
      2;

    // Add elbow losses if applicable
    if (form.hasElbow) {
      // Elbow loss coefficient (simplified)
      const elbowK = 0.5;
      const elbowLoss =
        elbowK *
        form.elbowCount *
        (airDensity * Math.pow(velocity, 2)) /
        2;
      pressureDrop += elbowLoss;
    }

    // Add cap/louver losses if applicable
    if (form.hasCapLouver) {
      // Cap loss coefficient (simplified)
      const capK = 0.8;
      const capLoss = capK * (airDensity * Math.pow(velocity, 2)) / 2;
      pressureDrop += capLoss;
    }

    // Convert to Pa (already in Pa from the formula)
    const pressurePa = Math.round(pressureDrop);

    setCalculatedValue(pressurePa);
  };

  const handleApply = () => {
    if (calculatedValue !== null) {
      onApply(calculatedValue, 'Pa');
      handleClose();
    }
  };

  const handleClear = () => {
    setForm({
      airVolume: '',
      material: '',
      ductLength: '',
      ductLengthUnit: 'm',
      diameter: '',
      hasElbow: false,
      elbowCount: 1,
      elbowRadius: '',
      hasCapLouver: false,
      wallCapType: '',
    });
    setErrors({});
    setCalculatedValue(null);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const handleFieldChange = (
    field: keyof FormState,
    value: string | boolean | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field
    if (typeof field === 'string' && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Reset calculation
    setCalculatedValue(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Static Pressure Calculator"
      description="Calculate the static pressure loss in your duct system to ensure proper system performance, efficiency, and safety."
      titleId="static-pressure-calc-title"
      descriptionId="static-pressure-calc-desc"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Air Volume */}
        <div>
          <label
            htmlFor="sp-air-volume"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Air Volume (CMH) <span className="text-[var(--error)]">*</span>
          </label>
          <input
            id="sp-air-volume"
            type="text"
            inputMode="decimal"
            value={form.airVolume}
            onChange={(e) => handleFieldChange('airVolume', e.target.value)}
            placeholder="Enter air volume"
            className={`w-full h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.airVolume
                ? 'border-[var(--error)]'
                : 'border-[var(--border)] focus:border-[var(--border-focus)]'
              }`}
          />
          {errors.airVolume && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.airVolume}</p>
          )}
        </div>

        {/* Duct Parameters Section */}
        <div className="border border-[var(--border)] rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            Duct Parameters
          </h4>

          {/* Material */}
          <div>
            <label
              htmlFor="sp-material"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Material <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="sp-material"
              value={form.material}
              onChange={(e) => handleFieldChange('material', e.target.value)}
              className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.material
                  ? 'border-[var(--error)]'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
            >
              <option value="">Select material</option>
              {ductMaterials.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
            {errors.material && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.material}</p>
            )}
          </div>

          {/* Duct Length */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label
                htmlFor="sp-duct-length"
                className="block text-sm font-medium text-[var(--foreground)] mb-1"
              >
                Length <span className="text-[var(--error)]">*</span>
              </label>
              <input
                id="sp-duct-length"
                type="text"
                inputMode="decimal"
                value={form.ductLength}
                onChange={(e) => handleFieldChange('ductLength', e.target.value)}
                placeholder="Length"
                className={`w-full h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.ductLength
                    ? 'border-[var(--error)]'
                    : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                  }`}
              />
              {errors.ductLength && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {errors.ductLength}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="sp-duct-length-unit"
                className="block text-sm font-medium text-[var(--foreground)] mb-1"
              >
                Unit
              </label>
              <select
                id="sp-duct-length-unit"
                value={form.ductLengthUnit}
                onChange={(e) =>
                  handleFieldChange('ductLengthUnit', e.target.value)
                }
                className="w-full h-11 px-3 border border-[var(--border)] rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>
          </div>

          {/* Diameter */}
          <div>
            <label
              htmlFor="sp-diameter"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Diameter <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="sp-diameter"
              value={form.diameter}
              onChange={(e) => handleFieldChange('diameter', e.target.value)}
              className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.diameter
                  ? 'border-[var(--error)]'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
            >
              <option value="">Select diameter</option>
              {diameterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.diameter && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.diameter}</p>
            )}
          </div>

          {/* Elbow 90° */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Elbow 90°:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hasElbow"
                  checked={form.hasElbow === true}
                  onChange={() => handleFieldChange('hasElbow', true)}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hasElbow"
                  checked={form.hasElbow === false}
                  onChange={() => handleFieldChange('hasElbow', false)}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Elbow details (if hasElbow) */}
          {form.hasElbow && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-[var(--border)]">
              <div>
                <label
                  htmlFor="sp-elbow-count"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Number of Elbows
                </label>
                <select
                  id="sp-elbow-count"
                  value={form.elbowCount}
                  onChange={(e) =>
                    handleFieldChange('elbowCount', Number(e.target.value))
                  }
                  className="w-full h-11 px-3 border border-[var(--border)] rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="sp-elbow-radius"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1"
                >
                  Radius (mm) <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  id="sp-elbow-radius"
                  type="text"
                  inputMode="decimal"
                  value={form.elbowRadius}
                  onChange={(e) =>
                    handleFieldChange('elbowRadius', e.target.value)
                  }
                  placeholder="Radius"
                  className={`w-full h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.elbowRadius
                      ? 'border-[var(--error)]'
                      : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                    }`}
                />
                {errors.elbowRadius && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {errors.elbowRadius}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cap/Louver */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Cap/Louver:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hasCapLouver"
                  checked={form.hasCapLouver === true}
                  onChange={() => handleFieldChange('hasCapLouver', true)}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hasCapLouver"
                  checked={form.hasCapLouver === false}
                  onChange={() => handleFieldChange('hasCapLouver', false)}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Wall Cap Type (if hasCapLouver) */}
          {form.hasCapLouver && (
            <div className="pl-4 border-l-2 border-[var(--border)]">
              <label
                htmlFor="sp-wall-cap"
                className="block text-sm font-medium text-[var(--foreground)] mb-1"
              >
                Wall Cap Type <span className="text-[var(--error)]">*</span>
              </label>
              <select
                id="sp-wall-cap"
                value={form.wallCapType}
                onChange={(e) => handleFieldChange('wallCapType', e.target.value)}
                className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.wallCapType
                    ? 'border-[var(--error)]'
                    : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                  }`}
              >
                <option value="">Select wall cap type</option>
                {wallCapTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.wallCapType && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {errors.wallCapType}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> The calculations are for reference. KDK
            is not responsible for any calculations.
          </p>
        </div>

        {/* Calculated Result */}
        {calculatedValue !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">
              Calculated Static Pressure:{' '}
              <span className="text-lg font-bold">{calculatedValue} Pa</span>
            </p>
            <button
              type="button"
              onClick={handleApply}
              className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-[10px] hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Apply to Static Pressure
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
          >
            Clear form
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            Calculate
          </button>
        </div>
      </div>
    </Modal>
  );
}
