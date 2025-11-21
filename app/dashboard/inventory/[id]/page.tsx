'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  expirationPeriod: number;
  costPerUnit: number;
  createdAt: string;
  updatedAt: string;
}

const ItemDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  // Fetch single item details
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['inventory', itemId],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Loading item details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="w-full h-full p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-semibold">Error loading item details</p>
            <p className="text-sm mt-2">
              {error instanceof Error ? error.message : 'Item not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categories: Record<string, string> = {
    fruits: 'Fruits & Berries',
    vegetables: 'Vegetables & Greens',
    dairy: 'Dairy Products',
    grains: 'Grains & Bread',
    protein: 'Protein Sources',
    beverages: 'Beverages',
    snacks: 'Snacks',
    other: 'Other',
  };

  return (
    <div className="w-full h-full p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Inventory
        </button>

        {/* Item Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Item Name */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{item.itemName}</h1>
            <p className="text-gray-600 mt-2">Item ID: {item._id}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 py-6 border-y">
            {/* Category */}
            <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-semibold mb-1">Category</p>
              <p className="text-lg font-bold text-gray-900">
                {categories[item.category] || item.category}
              </p>
            </div>

            {/* Expiration Period */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-semibold mb-1">
                Expiration Period
              </p>
              <p className="text-lg font-bold text-blue-900">{item.expirationPeriod} days</p>
            </div>

            {/* Cost per Unit */}
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-semibold mb-1">Cost per Unit</p>
              <p className="text-lg font-bold text-green-900">
                ${item.costPerUnit.toFixed(2)}
              </p>
            </div>

            {/* Total Value */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-semibold mb-1">
                Single Unit Cost
              </p>
              <p className="text-lg font-bold text-purple-900">
                tk {item.costPerUnit.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold">Added</p>
              <p>{new Date(item.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="font-semibold">Last Updated</p>
              <p>{new Date(item.updatedAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory')}
              className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold"
            >
              View All Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;
