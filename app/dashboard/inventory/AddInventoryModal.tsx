'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';


interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemName: string;
    category: string;
    expirationDate: string | null;
    hasExpiration: boolean;
    costPerUnit: number;
    quantity?: number;
    unit?: string;
  }) => void;
  isLoading: boolean;
  categories: string[];
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  categories,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'fruits',
    expirationDate: '',
    hasExpiration: true,
    costPerUnit: 0,
    quantity: 1,
    unit: 'pieces',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Cost per unit cannot be negative';
    }

    if (formData.hasExpiration && !formData.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required when expiration is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    onSubmit({
      itemName: formData.itemName,
      category: formData.category,
      expirationDate: formData.hasExpiration ? formData.expirationDate : null,
      hasExpiration: formData.hasExpiration,
      costPerUnit: formData.costPerUnit,
      quantity: formData.quantity,
      unit: formData.unit,
    });

    // Reset form after submission
    setFormData({
      itemName: '',
      category: 'fruits',
      expirationDate: '',
      hasExpiration: true,
      costPerUnit: 0,
      quantity: 1,
      unit: 'pieces',
    });
    setErrors({});
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-200 bg-linear-to-r from-orange-50 to-amber-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
            <p className="text-xs text-gray-500 mt-1">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-linear-to-r from-orange-500 to-amber-600 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* STEP 1 - Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📦 Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => {
                    setFormData({ ...formData, itemName: e.target.value });
                    if (errors.itemName) setErrors({ ...errors, itemName: '' });
                  }}
                  placeholder="e.g., Apple, Milk, Chicken"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.itemName
                      ? 'border-red-300 focus:ring-red-500/30'
                      : 'border-orange-200 focus:ring-orange-500/30'
                  }`}
                  disabled={isLoading}
                  autoFocus
                />
                {errors.itemName && (
                  <p className="text-red-600 text-sm mt-1">{errors.itemName}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📂 Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  disabled={isLoading}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📏 Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="1"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⚖️ Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  disabled={isLoading}
                >
                  <option value="pieces">Pieces</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="l">Liters (L)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 - Details */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Has Expiration */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasExpiration}
                    onChange={(e) =>
                      setFormData({ ...formData, hasExpiration: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-orange-500"
                    disabled={isLoading}
                  />
                  <span>⏰ Has Expiration Date</span>
                </label>
              </div>

              {formData.hasExpiration && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expirationDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.expirationDate
                        ? 'border-red-300 focus:ring-red-500/30'
                        : 'border-orange-200 focus:ring-orange-500/30'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.expirationDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.expirationDate}</p>
                  )}
                </div>
              )}

              {/* Cost Per Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Cost per Unit (tk)
                </label>
                <input
                  type="number"
                  value={formData.costPerUnit}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      costPerUnit: parseFloat(e.target.value) || 0,
                    });
                    if (errors.costPerUnit) setErrors({ ...errors, costPerUnit: '' });
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.costPerUnit
                      ? 'border-red-300 focus:ring-red-500/30'
                      : 'border-orange-200 focus:ring-orange-500/30'
                  }`}
                  disabled={isLoading}
                />
                {errors.costPerUnit && (
                  <p className="text-red-600 text-sm mt-1">{errors.costPerUnit}</p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200 mt-6">
                <p className="text-xs text-gray-600 mb-2">Summary</p>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-900">{formData.itemName}</p>
                  <p className="text-gray-600">{formData.quantity} {formData.unit} • {formData.category}</p>
                  <p className="text-orange-600 font-semibold">tk {formData.costPerUnit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-orange-200 mt-6">
            {step === 2 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all font-medium disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Item'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
