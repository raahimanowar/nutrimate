'use client';

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Package, Search, Filter, TrendingDown, DollarSign, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface FoodItem {
  _id: string;
  name: string;
  category: string;
  expirationDays: number;
  costPerUnit: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface GetFoodInventoryResponse {
  success: boolean;
  items: FoodItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch food inventory
const fetchFoodInventory = async (category?: string): Promise<GetFoodInventoryResponse> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  const response = await axios.get(`${API_BASE}/api/food-inventory?${params.toString()}`);
  return response.data;
};

const FoodInventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch inventory data
  const { data: inventoryData, isLoading } = useQuery<GetFoodInventoryResponse>({
    queryKey: ['foodInventory', selectedCategory],
    queryFn: () => fetchFoodInventory(selectedCategory || undefined),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const items = useMemo(() => inventoryData?.items || [], [inventoryData?.items]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return Array.from(cats).sort();
  }, [items]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalItems: filteredItems.length,
      totalQuantity: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: filteredItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0),
      expiringCategories: new Set(filteredItems.filter(item => item.expirationDays <= 7).map(item => item.category)).size,
    };
  }, [filteredItems]);

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'dairy': 'bg-blue-100 text-blue-700 border-blue-200',
      'fruit': 'bg-red-100 text-red-700 border-red-200',
      'vegetable': 'bg-green-100 text-green-700 border-green-200',
      'grain': 'bg-amber-100 text-amber-700 border-amber-200',
      'meat': 'bg-rose-100 text-rose-700 border-rose-200',
      'frozen': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'pantry': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get expiration status
  const getExpirationStatus = (days: number) => {
    if (days <= 2) return { label: 'Expiring Today', color: 'bg-red-50 border-red-200 text-red-700' };
    if (days <= 7) return { label: 'Expiring Soon', color: 'bg-orange-50 border-orange-200 text-orange-700' };
    if (days <= 14) return { label: 'Approaching', color: 'bg-amber-50 border-amber-200 text-amber-700' };
    return { label: 'Fresh', color: 'bg-green-50 border-green-200 text-green-700' };
  };

  console.log(filteredItems);
  

  if (isLoading) {
    return <LoadingSpinner message="Loading Food Inventory..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Food Inventory
          </h1>
          <p className="text-gray-600 mt-2">Track your food stock and expiration dates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Items</p>
                <p className="text-3xl font-black text-orange-600">{stats.totalItems}</p>
              </div>
              <Package className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-amber-100 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Quantity</p>
                <p className="text-3xl font-black text-amber-600">{stats.totalQuantity}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-amber-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Value</p>
                <p className="text-3xl font-black text-green-600">tk {stats.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-red-100 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expiring Soon</p>
                <p className="text-3xl font-black text-red-600">{stats.expiringCategories}</p>
              </div>
              <Clock className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by food name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const expirationStatus = getExpirationStatus(item.expirationDays);
              return (
                <div key={item._id} className="bg-white rounded-2xl border-2 border-orange-100 shadow-lg hover:shadow-xl hover:border-orange-300 transition-all duration-300 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border-2 ${getCategoryColor(item.category)}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Expiration Status */}
                  <div className={`px-3 py-2 rounded-lg border-2 ${expirationStatus.color} text-center`}>
                    <p className="text-sm font-bold">{expirationStatus.label}</p>
                    <p className="text-xs font-semibold">{item.expirationDays} days</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-orange-50">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Quantity</p>
                      <p className="text-2xl font-black text-orange-600">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Cost/Unit</p>
                      <p className="text-2xl font-black text-amber-600">tk {item.costPerUnit.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-100">
                    <p className="text-xs text-gray-600 font-medium">Total Value</p>
                    <p className="text-2xl font-black text-orange-600">tk {(item.quantity * item.costPerUnit).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-16 border-2 border-dashed border-orange-200 text-center">
            <Package className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Items Found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory ? 'Try adjusting your filters' : 'No food inventory items available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodInventoryPage;