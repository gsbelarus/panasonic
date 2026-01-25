'use client';

import { useCallback, useState } from 'react';
import Modal from './Modal';

interface AirVolumeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number, unit: string) => void;
}

// Mock data for room types based on site type
const roomTypesBySiteType: Record<string, string[]> = {
  Hotel: ['Guest Room', 'Lobby', 'Restaurant', 'Kitchen', 'Bathroom', 'Conference Room'],
  'Office Building': ['Private Office', 'Open Plan Office', 'Conference Room', 'Reception', 'Break Room', 'Server Room'],
  Public: ['Waiting Area', 'Corridor', 'Public Restroom', 'Auditorium', 'Library'],
  Residential: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage', 'Basement'],
  Restaurants: ['Dining Area', 'Kitchen', 'Bar', 'Storage', 'Restroom'],
  Retail: ['Sales Floor', 'Storage Room', 'Fitting Room', 'Back Office'],
  School: ['Classroom', 'Laboratory', 'Gymnasium', 'Cafeteria', 'Library', 'Auditorium'],
  'Sports/Entertainment': ['Gymnasium', 'Locker Room', 'Arena Seating', 'Indoor Pool', 'Theater'],
  Miscellaneous: ['Warehouse', 'Workshop', 'Parking Garage', 'Utility Room'],
  'Min Exhaust Rates': ['General', 'High Pollutant', 'Medium Pollutant', 'Low Pollutant'],
};

// Air changes per hour factor by room type (simplified)
const airChangeFactors: Record<string, number> = {
  'Guest Room': 6,
  Lobby: 8,
  Restaurant: 12,
  Kitchen: 15,
  Bathroom: 10,
  'Conference Room': 8,
  'Private Office': 6,
  'Open Plan Office': 8,
  Reception: 6,
  'Break Room': 10,
  'Server Room': 15,
  'Waiting Area': 6,
  Corridor: 4,
  'Public Restroom': 12,
  Auditorium: 8,
  Library: 4,
  'Living Room': 4,
  Bedroom: 4,
  Garage: 6,
  Basement: 4,
  'Dining Area': 10,
  Bar: 12,
  Storage: 4,
  Restroom: 10,
  'Sales Floor': 6,
  'Storage Room': 4,
  'Fitting Room': 8,
  'Back Office': 6,
  Classroom: 6,
  Laboratory: 10,
  Gymnasium: 8,
  Cafeteria: 10,
  'Locker Room': 10,
  'Arena Seating': 6,
  'Indoor Pool': 10,
  Theater: 6,
  Warehouse: 4,
  Workshop: 8,
  'Parking Garage': 6,
  'Utility Room': 4,
  General: 6,
  'High Pollutant': 15,
  'Medium Pollutant': 10,
  'Low Pollutant': 6,
};

interface FormState {
  siteType: string;
  roomType: string;
  sizeUnit: string;
  width: string;
  length: string;
}

interface FormErrors {
  siteType?: string;
  roomType?: string;
  width?: string;
  length?: string;
}

export default function AirVolumeCalculatorModal({
  isOpen,
  onClose,
  onApply,
}: AirVolumeCalculatorModalProps) {
  const [form, setForm] = useState<FormState>({
    siteType: '',
    roomType: '',
    sizeUnit: 'm',
    width: '',
    length: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const roomTypes = form.siteType ? roomTypesBySiteType[form.siteType] || [] : [];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.siteType) {
      newErrors.siteType = 'Selection is required';
    }
    if (!form.roomType) {
      newErrors.roomType = 'Selection is required';
    }
    if (!form.width) {
      newErrors.width = 'Width is required';
    } else if (isNaN(Number(form.width)) || Number(form.width) <= 0) {
      newErrors.width = 'Invalid input';
    }
    if (!form.length) {
      newErrors.length = 'Length is required';
    } else if (isNaN(Number(form.length)) || Number(form.length) <= 0) {
      newErrors.length = 'Invalid input';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    // Convert dimensions to meters
    let widthM = Number(form.width);
    let lengthM = Number(form.length);

    if (form.sizeUnit === 'mm') {
      widthM /= 1000;
      lengthM /= 1000;
    } else if (form.sizeUnit === 'cm') {
      widthM /= 100;
      lengthM /= 100;
    }

    // Assume ceiling height of 2.7m for calculation
    const ceilingHeight = 2.7;
    const volume = widthM * lengthM * ceilingHeight;

    // Get air change factor for room type
    const airChanges = airChangeFactors[form.roomType] || 6;

    // Calculate CMH (Cubic Meters per Hour)
    const cmh = Math.round(volume * airChanges);

    setCalculatedValue(cmh);
  };

  const handleApply = () => {
    if (calculatedValue !== null) {
      onApply(calculatedValue, 'CMH');
      handleClose();
    }
  };

  const handleClear = useCallback(() => {
    setForm({
      siteType: '',
      roomType: '',
      sizeUnit: 'm',
      width: '',
      length: '',
    });
    setErrors({});
    setCalculatedValue(null);
  }, []);

  const handleClose = useCallback(() => {
    handleClear();
    onClose();
  }, [handleClear, onClose]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      // Reset room type when site type changes
      if (field === 'siteType') {
        newForm.roomType = '';
      }
      return newForm;
    });
    // Clear error for the field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Reset calculation
    setCalculatedValue(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Air Volume Calculator"
      description="Determine the necessary airflow for a room based on room type and size."
      titleId="air-volume-calc-title"
      descriptionId="air-volume-calc-desc"
    >
      <div className="space-y-4">
        {/* Site Type */}
        <div>
          <label
            htmlFor="calc-site-type"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Site Type <span className="text-[var(--error)]">*</span>
          </label>
          <select
            id="calc-site-type"
            value={form.siteType}
            onChange={(e) => handleFieldChange('siteType', e.target.value)}
            className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.siteType
                ? 'border-[var(--error)]'
                : 'border-[var(--border)] focus:border-[var(--border-focus)]'
              }`}
          >
            <option value="">Select site type</option>
            {Object.keys(roomTypesBySiteType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.siteType && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.siteType}</p>
          )}
        </div>

        {/* Room Type */}
        <div>
          <label
            htmlFor="calc-room-type"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Room Type <span className="text-[var(--error)]">*</span>
          </label>
          <select
            id="calc-room-type"
            value={form.roomType}
            onChange={(e) => handleFieldChange('roomType', e.target.value)}
            disabled={!form.siteType}
            className={`w-full h-11 px-3 border rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.roomType
                ? 'border-[var(--error)]'
                : 'border-[var(--border)] focus:border-[var(--border-focus)]'
              }`}
          >
            <option value="">Select room type</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.roomType && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.roomType}</p>
          )}
        </div>

        {/* Size Unit */}
        <div>
          <label
            htmlFor="calc-size-unit"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Room Size Unit
          </label>
          <select
            id="calc-size-unit"
            value={form.sizeUnit}
            onChange={(e) => handleFieldChange('sizeUnit', e.target.value)}
            className="w-full h-11 px-3 border border-[var(--border)] rounded-[10px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--border-focus)]"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
          </select>
        </div>

        {/* Width and Length */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="calc-width"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Width <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="calc-width"
              type="text"
              inputMode="decimal"
              value={form.width}
              onChange={(e) => handleFieldChange('width', e.target.value)}
              placeholder={`Width (${form.sizeUnit})`}
              className={`w-full h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.width
                  ? 'border-[var(--error)]'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
            />
            {errors.width && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.width}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="calc-length"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Length <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="calc-length"
              type="text"
              inputMode="decimal"
              value={form.length}
              onChange={(e) => handleFieldChange('length', e.target.value)}
              placeholder={`Length (${form.sizeUnit})`}
              className={`w-full h-11 px-3 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.length
                  ? 'border-[var(--error)]'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
            />
            {errors.length && (
              <p className="mt-1 text-xs text-[var(--error)]">{errors.length}</p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> The calculations are for reference. KDK is not responsible for any calculations.
          </p>
        </div>

        {/* Calculated Result */}
        {calculatedValue !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-green-800">
              Calculated Air Volume:{' '}
              <span className="text-lg font-bold">{calculatedValue} CMH</span>
            </p>
            <button
              type="button"
              onClick={handleApply}
              className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-[10px] hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Apply to Air Volume
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mt-4">
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
