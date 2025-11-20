'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, X, Calendar, Droplet, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface DailyLogItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other";
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "beverage";
  notes?: string;
}

interface DailyLog {
  _id: string;
  userId: string;
  date: string;
  items: DailyLogItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  username: string;
  dietaryNeeds?: {
    waterIntakeGoal?: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

const getDailyLog = async (date: string): Promise<DailyLog> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/daily-log/log`, {
    params: { date },
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

const addItem = async (data: { date?: string; item: Omit<DailyLogItem, '_id'> }): Promise<DailyLog> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post(`${API_BASE}/api/daily-log/item`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

const deleteItem = async (data: { logId: string; itemId: string }): Promise<DailyLog> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.delete(
    `${API_BASE}/api/daily-log/item/${data.logId}/${data.itemId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const updateWaterIntake = async (data: { date: string; waterIntake: number }): Promise<DailyLog> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.put(
    `${API_BASE}/api/daily-log/water`,
    { date: data.date, waterIntake: data.waterIntake },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const DailyLogPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newItem, setNewItem] = useState<Omit<DailyLogItem, '_id'>>({
    itemName: '',
    quantity: 1,
    unit: 'grams',
    category: 'other',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    mealType: 'snack',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Fetch user profile to get water intake goal
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfile(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const waterIntakeGoal = userProfile?.dietaryNeeds?.waterIntakeGoal || 8;

  // Fetch daily log
  const { data: dailyLog, isLoading, error } = useQuery<DailyLog>({
    queryKey: ['dailyLog', selectedDate],
    queryFn: () => getDailyLog(selectedDate),
  });

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: addItem,
    onSuccess: (data) => {
      queryClient.setQueryData(['dailyLog', selectedDate], data);
      setNewItem({
        itemName: '',
        quantity: 1,
        unit: 'grams',
        category: 'other',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        mealType: 'snack',
        notes: '',
      });
      setShowAddModal(false);
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: (data) => {
      queryClient.setQueryData(['dailyLog', selectedDate], data);
    },
  });

  // Update water intake mutation
  const waterMutation = useMutation({
    mutationFn: updateWaterIntake,
    onSuccess: (data) => {
      // Update the query data immediately to prevent any UI inconsistency
      queryClient.setQueryData(['dailyLog', selectedDate], data);
      
      // Also invalidate the query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['dailyLog', selectedDate] });
    },
    onError: () => {
      // Refetch on error to restore correct state
      queryClient.invalidateQueries({ queryKey: ['dailyLog', selectedDate] });
    },
  });

  const handleAddItem = () => {
    addMutation.mutate({
      date: selectedDate,
      item: newItem,
    });
    setShowAddModal(false);
  };

  const handleDeleteItem = (itemId: string) => {
    const item = dailyLog?.items.find(i => i._id === itemId);
    if (!item) return;

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-900">Delete Item?</p>
        <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-bold">{item.itemName}</span>?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (dailyLog) {
                deleteMutation.mutate({
                  logId: dailyLog._id,
                  itemId,
                });
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: {
        background: '#fff',
        color: '#000',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px',
      }
    });
  };

  const handleWaterIntakeChange = (value: number) => {
    const wasBeforeGoal = (dailyLog?.waterIntake || 0) < waterIntakeGoal;
    const isAfterGoal = value >= waterIntakeGoal;

    waterMutation.mutate(
      {
        date: selectedDate,
        waterIntake: value,
      },
      {
        onSuccess: () => {
          // Show success toast when goal is reached
          if (wasBeforeGoal && isAfterGoal) {
            toast.success(
              () => (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-bold text-gray-900">Great Job! 🎉</p>
                    <p className="text-sm text-gray-600">You&apos;ve reached your daily water goal!</p>
                  </div>
                </div>
              ),
              {
                duration: 4000,
                style: {
                  background: '#dcfce7',
                  color: '#000',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #22c55e',
                  padding: '16px',
                }
              }
            );
          }
        }
      }
    );
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-green-100 text-green-800';
      case 'dinner':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-purple-100 text-purple-800';
      case 'beverage':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      fruits: '🍎',
      vegetables: '🥕',
      dairy: '🥛',
      grains: '🌾',
      protein: '🍗',
      beverages: '🥤',
      snacks: '🍿',
      other: '🍽️',
    };
    return icons[category] || '🍽️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Loading daily log...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-8 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Error Loading Daily Log</h3>
          </div>
          <p className="text-red-700">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header with Date Selector Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900">Daily Log</h1>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-5 h-5" />
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border-2 border-orange-200 shadow-xl p-4 z-40">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                  className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Nutrition Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calories Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Daily Summary</h3>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-orange-100 to-amber-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Calories</p>
                  <p className="text-2xl font-black text-orange-600">{dailyLog?.totalCalories || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">kcal</p>
                </div>
                <div className="bg-linear-to-br from-red-100 to-pink-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Protein</p>
                  <p className="text-2xl font-black text-red-600">{(dailyLog?.totalProtein || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">g</p>
                </div>
                <div className="bg-linear-to-br from-yellow-100 to-amber-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Carbs</p>
                  <p className="text-2xl font-black text-yellow-600">{(dailyLog?.totalCarbs || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">g</p>
                </div>
                <div className="bg-linear-to-br from-green-100 to-lime-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Fats</p>
                  <p className="text-2xl font-black text-green-600">{(dailyLog?.totalFats || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">g</p>
                </div>
                <div className="bg-linear-to-br from-blue-100 to-cyan-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Fiber</p>
                  <p className="text-2xl font-black text-blue-600">{(dailyLog?.totalFiber || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">g</p>
                </div>
                <div className="bg-linear-to-br from-purple-100 to-pink-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Sugar</p>
                  <p className="text-2xl font-black text-purple-600">{(dailyLog?.totalSugar || 0).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">g</p>
                </div>
              </div>
            </div>

            {/* Food Items */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Food Items ({dailyLog?.items?.length || 0})</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>

              {/* Add Form - Normal inline form */}
              {showAddModal && (
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      <Plus className="w-6 h-6 text-orange-600" />
                      Add Food Item
                    </h4>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setNewItem({
                          itemName: '',
                          quantity: 1,
                          unit: 'grams',
                          category: 'other',
                          calories: 0,
                          protein: 0,
                          carbs: 0,
                          fats: 0,
                          fiber: 0,
                          sugar: 0,
                          sodium: 0,
                          mealType: 'snack',
                          notes: '',
                        });
                      }}
                      className="p-2 hover:bg-orange-200 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-orange-600" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Item Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Apple"
                          value={newItem.itemName}
                          onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Qty *</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                        />
                      </div>
                    </div>

                    {/* Unit & Category */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Unit</label>
                        <select
                          value={newItem.unit}
                          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                        >
                          <option value="grams">Grams</option>
                          <option value="pieces">Pieces</option>
                          <option value="cups">Cups</option>
                          <option value="servings">Servings</option>
                          <option value="ml">ML</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value as "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other" })}
                          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                        >
                          <option value="fruits">🍎 Fruits</option>
                          <option value="vegetables">🥕 Vegetables</option>
                          <option value="dairy">🥛 Dairy</option>
                          <option value="grains">🌾 Grains</option>
                          <option value="protein">🍗 Protein</option>
                          <option value="beverages">🥤 Beverages</option>
                          <option value="snacks">🍿 Snacks</option>
                          <option value="other">🍽️ Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Meal Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Meal Type</label>
                      <select
                        value={newItem.mealType}
                        onChange={(e) => setNewItem({ ...newItem, mealType: e.target.value as "breakfast" | "lunch" | "dinner" | "snack" | "beverage" })}
                        className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                      >
                        <option value="breakfast">🌅 Breakfast</option>
                        <option value="lunch">🍽️ Lunch</option>
                        <option value="dinner">🌙 Dinner</option>
                        <option value="snack">🍪 Snack</option>
                        <option value="beverage">☕ Beverage</option>
                      </select>
                    </div>

                    {/* Nutrition Grid */}
                    <div className="bg-white rounded-lg p-4 border border-orange-300">
                      <h5 className="text-xs font-bold text-orange-700 mb-3 uppercase tracking-wider">Nutrition (per serving)</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Calories</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.calories || 0}
                            onChange={(e) => setNewItem({ ...newItem, calories: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Protein (g)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.protein || 0}
                            onChange={(e) => setNewItem({ ...newItem, protein: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Carbs (g)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.carbs || 0}
                            onChange={(e) => setNewItem({ ...newItem, carbs: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Fats (g)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.fats || 0}
                            onChange={(e) => setNewItem({ ...newItem, fats: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Fiber (g)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.fiber || 0}
                            onChange={(e) => setNewItem({ ...newItem, fiber: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 font-semibold mb-1">Sugar (g)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.sugar || 0}
                            onChange={(e) => setNewItem({ ...newItem, sugar: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-900 font-medium text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Notes</label>
                      <textarea
                        placeholder="Optional notes..."
                        value={newItem.notes || ''}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm text-gray-900 font-medium"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-orange-200">
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setNewItem({
                            itemName: '',
                            quantity: 1,
                            unit: 'grams',
                            category: 'other',
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fats: 0,
                            fiber: 0,
                            sugar: 0,
                            sodium: 0,
                            mealType: 'snack',
                            notes: '',
                          });
                        }}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddItem}
                        disabled={addMutation.isPending || !newItem.itemName}
                        className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addMutation.isPending ? 'Adding...' : 'Add Item'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {dailyLog?.items && dailyLog.items.length > 0 ? (
                  dailyLog.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{item.itemName}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMealTypeColor(item.mealType)}`}>
                              {item.mealType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.quantity} {item.unit} • {item.calories} kcal • P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No items logged yet. Add your first item!</p>
                )}
              </div>
            </div>
          </div>

          {/* Water Intake Sidebar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-8">
            <div className="flex items-center gap-2 mb-8">
              <Droplet className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Water Intake</h3>
            </div>

            {/* Water Intake Display */}
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <p className="text-5xl font-black text-blue-600 mb-2">{dailyLog?.waterIntake || 0}</p>
                <p className="text-sm text-gray-600 font-medium">glasses today</p>
                <p className="text-xs text-gray-500 mt-2">Goal: {waterIntakeGoal} glasses/day</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden mb-4">
                <div
                  className="bg-linear-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(((dailyLog?.waterIntake || 0) / waterIntakeGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center">
                {Math.round(((dailyLog?.waterIntake || 0) / waterIntakeGoal) * 100)}% of daily goal
              </p>
            </div>

            {/* Visual Glasses Display */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <div
                  key={index}
                  onClick={() => handleWaterIntakeChange(index)}
                  className={`cursor-pointer aspect-square rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                    (dailyLog?.waterIntake || 0) >= index
                      ? 'bg-linear-to-br from-blue-400 to-cyan-500 text-white shadow-lg'
                      : 'bg-blue-100 text-blue-400 hover:bg-blue-150'
                  }`}
                >
                  <Droplet className="w-5 h-5" />
                </div>
              ))}
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleWaterIntakeChange(Math.max(0, (dailyLog?.waterIntake || 0) - 1))}
                  disabled={waterMutation.isPending || !dailyLog?.waterIntake}
                  className="flex-1 py-2 px-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  - Remove
                </button>
                <button
                  onClick={() => handleWaterIntakeChange((dailyLog?.waterIntake || 0) + 1)}
                  disabled={waterMutation.isPending || (dailyLog?.waterIntake || 0) >= 50}
                  className="flex-1 py-2 px-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Glass
                </button>
              </div>
              
              {/* Quick Set Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200 mt-4">
                <button
                  onClick={() => handleWaterIntakeChange(4)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                >
                  Half (4)
                </button>
                <button
                  onClick={() => handleWaterIntakeChange(8)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                >
                  Full (8)
                </button>
                <button
                  onClick={() => handleWaterIntakeChange(12)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                >
                  Extra (12)
                </button>
                <button
                  onClick={() => handleWaterIntakeChange(0)}
                  className="py-2 px-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Loading State */}
            {waterMutation.isPending && (
              <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-center">
                <p className="text-sm text-blue-700 font-medium">Updating water intake...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogPage;