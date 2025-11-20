"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Package, TrendingUp, Droplet, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
  movingAverage?: number;
}

interface CalorieChartData {
  calories: ChartDataPoint[];
  protein: ChartDataPoint[];
  carbs: ChartDataPoint[];
  fats: ChartDataPoint[];
}

interface WaterChartData {
  waterIntake: Array<{
    date: string;
    value: number;
    movingAverage?: number;
    goalMet: boolean;
  }>;
}

interface CalorieResponse {
  success: boolean;
  data: {
    chartData: CalorieChartData;
    summary: {
      calories: {
        average: number;
        min: number;
        max: number;
        total: number;
      };
      protein: { average: number; total: number };
      carbs: { average: number; total: number };
      fats: { average: number; total: number };
    };
    timeRange: {
      type: string;
      startDate: string;
      endDate: string;
      dayCount: number;
    };
  };
}

interface WaterResponse {
  success: boolean;
  data: {
    chartData: WaterChartData;
    summary: {
      waterIntake: {
        average: number;
        min: number;
        max: number;
        total: number;
      };
      hydrationGoal: {
        daily: number;
        totalMet: number;
        percentageMet: number;
      };
    };
    timeRange: {
      type: string;
      startDate: string;
      endDate: string;
      dayCount: number;
    };
  };
}

interface InventoryData {
  totalCount: number;
  categoryBreakdown: Record<string, number>;
  expiringSoon: number;
  averageCostPerUnit: number;
}

interface RecentLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalItems: number;
}

interface SummaryResponse {
  success: boolean;
  data: {
    inventory: InventoryData;
    recentLogs: RecentLog[];
  };
  timeRange: {
    type: string;
    startDate: string;
    endDate: string;
    dayCount: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch summary data
const fetchSummary = async (range: 'daily' | 'weekly' | 'monthly'): Promise<SummaryResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/tracking/summary`, {
    params: { range },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch calorie chart data
const fetchCalorieData = async (range: 'daily' | 'weekly' | 'monthly'): Promise<CalorieResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/tracking/calories`, {
    params: { range },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch water intake data
const fetchWaterData = async (range: 'daily' | 'weekly' | 'monthly'): Promise<WaterResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/tracking/water`, {
    params: { range },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const DashboardPage = () => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Fetch all data with optimized TanStack Query configuration
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery<SummaryResponse>({
    queryKey: ['trackingSummary', range],
    queryFn: () => fetchSummary(range),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: calorieData, isLoading: calorieLoading, error: calorieError } = useQuery<CalorieResponse>({
    queryKey: ['calorieData', range],
    queryFn: () => fetchCalorieData(range),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: waterData, isLoading: waterLoading, error: waterError } = useQuery<WaterResponse>({
    queryKey: ['waterData', range],
    queryFn: () => fetchWaterData(range),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const isLoading = summaryLoading || calorieLoading || waterLoading;
  const hasError = summaryError || calorieError || waterError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border-2 border-red-200 shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-6">There was an error fetching your nutrition data. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare calorie chart data
  const calorieChartData = calorieData?.data?.chartData?.calories?.map((item, idx) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: item.value,
    movingAvg: item.movingAverage,
    protein: calorieData.data.chartData.protein[idx]?.value || 0,
    carbs: calorieData.data.chartData.carbs[idx]?.value || 0,
    fats: calorieData.data.chartData.fats[idx]?.value || 0,
  })) || [];

  // Prepare water chart data
  const waterChartData = waterData?.data?.chartData?.waterIntake?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    water: item.value,
    goal: 8,
    movingAvg: item.movingAverage || item.value,
  })) || [];

  const inventory = summaryData?.data?.inventory;
  const hydrationGoal = waterData?.data?.summary?.hydrationGoal;
  const calorieSummary = calorieData?.data?.summary?.calories;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-amber-500 mx-auto animate-pulse"></div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-800">Loading Dashboard</p>
            <p className="text-sm text-gray-600">Fetching your nutrition data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Range Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Nutrition Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your health and wellness journey</p>
          </div>

          {/* Range Selector */}
          <div className="flex gap-2 bg-white rounded-full p-1.5 border-2 border-orange-200 shadow-lg">
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-5 py-2 rounded-full font-semibold transition-all capitalize text-sm ${
                  range === r
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards - 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inventory Card */}
          <div className="bg-white rounded-2xl p-8 border-2 border-orange-100 shadow-lg hover:shadow-xl hover:border-orange-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">Inventory</p>
                <p className="text-4xl font-black text-orange-700 mt-2">{inventory?.totalCount || 0}</p>
                <p className="text-xs text-gray-500 mt-1">items tracked</p>
              </div>
              <Package className="w-10 h-10 text-orange-400" />
            </div>
            {inventory?.expiringSoon ? (
              <p className="text-xs text-amber-600 font-semibold">⚠ {inventory.expiringSoon} expiring soon</p>
            ) : null}
          </div>

          {/* Calories Card */}
          <div className="bg-white rounded-2xl p-8 border-2 border-red-100 shadow-lg hover:shadow-xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Calories</p>
                <p className="text-4xl font-black text-red-700 mt-2">{Math.round(calorieSummary?.average || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">avg kcal</p>
              </div>
              <Flame className="w-10 h-10 text-red-400" />
            </div>
            <div className="text-xs text-gray-600">
              <p>Min: {Math.round(calorieSummary?.min || 0)} | Max: {Math.round(calorieSummary?.max || 0)}</p>
            </div>
          </div>

          {/* Hydration Card */}
          <div className="bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Hydration</p>
                <p className="text-4xl font-black text-blue-700 mt-2">{hydrationGoal?.percentageMet || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">goal met</p>
              </div>
              <Droplet className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-xs text-gray-600">Goal: {hydrationGoal?.daily || 8} glasses/day</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Trend Chart */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Daily Calorie Intake
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={calorieChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e7d8" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #f97316',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => [value.toFixed(0), 'kcal']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Calories"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  stroke="#fb923c"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="7-Day Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Water Intake Chart */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              Daily Water Intake
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={waterChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e7d8" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" label={{ value: 'Glasses', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => [value.toFixed(1), 'glasses']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="water"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Water Intake"
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#d1d5db"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Daily Goal"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Macro Breakdown Chart - Full Width */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Macro Nutrients Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={calorieChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e7d8" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" label={{ value: 'Grams', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => value.toFixed(0)}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend />
                <Bar dataKey="protein" fill="#f97316" name="Protein (g)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="carbs" fill="#fbbf24" name="Carbs (g)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fats" fill="#fb923c" name="Fats (g)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs Section */}
        {summaryData?.data?.recentLogs && summaryData.data.recentLogs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Food Logs</h2>
            <div className="space-y-3">
              {summaryData.data.recentLogs.slice(0, 5).map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-400 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{log.totalItems} items logged</p>
                    <p className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-orange-600">{log.totalCalories} kcal</p>
                    <p className="text-sm text-gray-600">{log.totalProtein}g protein</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!inventory || inventory.totalCount === 0) && (!summaryData?.data?.recentLogs || summaryData.data.recentLogs.length === 0) && (
          <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-12 border-2 border-orange-200 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-200 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Tracking Your Nutrition</h3>
            <p className="text-gray-700 mb-6">Add food items to your inventory to begin monitoring your daily intake and stay healthy!</p>
            <Link href="/dashboard/inventory">
              <Button className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl">
                Go to Inventory →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
