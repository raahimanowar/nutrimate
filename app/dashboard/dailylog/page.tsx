'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Save, X, Calendar, Droplet, TrendingUp, AlertCircle } from 'lucide-react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  const [showAddForm, setShowAddForm] = useState(false);
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
      setShowAddForm(false);
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
      queryClient.setQueryData(['dailyLog', selectedDate], data);
    },
  });

  const handleAddItem = () => {
    addMutation.mutate({
      date: selectedDate,
      item: newItem,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (dailyLog) {
      deleteMutation.mutate({
        logId: dailyLog._id,
        itemId,
      });
    }
  };

  const handleWaterIntakeChange = (value: number) => {
    waterMutation.mutate({
      date: selectedDate,
      waterIntake: value,
    });
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
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Daily Food Log</h1>
          <p className="text-gray-600">Track your nutrition intake</p>
        </div>

        {/* Date Selector */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-orange-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Add New Food Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={newItem.itemName}
                      onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="grams">grams</option>
                      <option value="pieces">pieces</option>
                      <option value="cups">cups</option>
                      <option value="servings">servings</option>
                      <option value="ml">ml</option>
                    </select>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other" })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="fruits">Fruits</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="dairy">Dairy</option>
                      <option value="grains">Grains</option>
                      <option value="protein">Protein</option>
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={newItem.mealType}
                      onChange={(e) => setNewItem({ ...newItem, mealType: e.target.value as "breakfast" | "lunch" | "dinner" | "snack" | "beverage" })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="beverage">Beverage</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Calories"
                      value={newItem.calories || 0}
                      onChange={(e) => setNewItem({ ...newItem, calories: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newItem.protein || 0}
                      onChange={(e) => setNewItem({ ...newItem, protein: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={newItem.carbs || 0}
                      onChange={(e) => setNewItem({ ...newItem, carbs: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Fats (g)"
                      value={newItem.fats || 0}
                      onChange={(e) => setNewItem({ ...newItem, fats: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <textarea
                    placeholder="Notes (optional)"
                    value={newItem.notes || ''}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAddItem}
                      disabled={addMutation.isPending || !newItem.itemName}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      <Save size={18} />
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      <X size={18} />
                      Cancel
                    </button>
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Droplet className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Water Intake</h3>
            </div>
            <div className="bg-linear-to-br from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 text-center">
              <p className="text-4xl font-black text-blue-600">{dailyLog?.waterIntake || 0}</p>
              <p className="text-sm text-gray-600 font-medium mt-2">glasses/day</p>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => handleWaterIntakeChange(count)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                    dailyLog?.waterIntake === count
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {count} glasses
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogPage;