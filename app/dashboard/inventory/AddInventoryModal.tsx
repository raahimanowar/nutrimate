'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';


interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemName: string;
    category: string;
    expirationDate: string | null;
    hasExpiration: boolean;
    costPerUnit: number;
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
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'fruits',
    expirationDate: '',
    hasExpiration: true,
    costPerUnit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Cost per unit cannot be negative';
    }

    if (formData.hasExpiration && !formData.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required when expiration is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      itemName: formData.itemName,
      category: formData.category,
      expirationDate: formData.hasExpiration ? formData.expirationDate : null,
      hasExpiration: formData.hasExpiration,
      costPerUnit: formData.costPerUnit,
    });

    // Reset form after submission
    setFormData({
      itemName: '',
      category: 'fruits',
      expirationDate: '',
      hasExpiration: true,
      costPerUnit: 0,
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name
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
                  : 'border-gray-300 focus:ring-orange-500/30'
              }`}
              disabled={isLoading}
            />
            {errors.itemName && (
              <p className="text-red-600 text-sm mt-1">{errors.itemName}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
              disabled={isLoading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Has Expiration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasExpiration}
                onChange={(e) =>
                  setFormData({ ...formData, hasExpiration: e.target.checked })
                }
                className="w-4 h-4 rounded accent-orange-500"
                disabled={isLoading}
              />
              Has Expiration Date
            </label>
          </div>

          {formData.hasExpiration && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiration Date
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
                    : 'border-gray-300 focus:ring-orange-500/30'
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
              Cost per Unit ($)
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
                  : 'border-gray-300 focus:ring-orange-500/30'
              }`}
              disabled={isLoading}
            />
            {errors.costPerUnit && (
              <p className="text-red-600 text-sm mt-1">{errors.costPerUnit}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all font-medium disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
