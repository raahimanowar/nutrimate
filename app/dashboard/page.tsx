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
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Fetch all data
  const { data: summaryData, isLoading: summaryLoading } = useQuery<SummaryResponse>({
    queryKey: ['trackingSummary', range],
    queryFn: () => fetchSummary(range),
  });

  const { data: calorieData, isLoading: calorieLoading } = useQuery<CalorieResponse>({
    queryKey: ['calorieData', range],
    queryFn: () => fetchCalorieData(range),
  });

  const { data: waterData, isLoading: waterLoading } = useQuery<WaterResponse>({
    queryKey: ['waterData', range],
    queryFn: () => fetchWaterData(range),
  });

  const isLoading = summaryLoading || calorieLoading || waterLoading;

  // Prepare calorie chart data
  const calorieChartData = calorieData?.data?.chartData?.calories?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: item.value,
    movingAvg: item.movingAverage,
  })) || [];

  // Prepare macro chart data
  const macroChartData = calorieData?.data?.chartData?.calories?.map((cal, idx) => ({
    date: new Date(cal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    protein: calorieData.data.chartData.protein[idx]?.value || 0,
    carbs: calorieData.data.chartData.carbs[idx]?.value || 0,
    fats: calorieData.data.chartData.fats[idx]?.value || 0,
  })) || [];

  // Prepare water chart data
  const waterChartData = waterData?.data?.chartData?.waterIntake?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    water: item.value,
    goal: 8,
    goalMet: item.goalMet ? 1 : 0,
  })) || [];

  const inventory = summaryData?.data?.inventory;
  const hydrationGoal = waterData?.data?.summary?.hydrationGoal;
  const calorieSummary = calorieData?.data?.summary?.calories;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header with Range Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-lg text-gray-600">Track your nutrition journey with confidence</p>
          </div>

          {/* Range Selector */}
          <div className="flex gap-3 bg-white/60 backdrop-blur-md rounded-full p-1.5 border border-orange-200">
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-6 py-2 rounded-full font-semibold transition-all capitalize ${
                  range === r
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inventory Card */}
          <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-orange-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-orange-100/20 to-amber-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Inventory</span>
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-5xl font-black text-orange-600 mt-2">{inventory?.totalCount || 0}</p>
              <p className="text-sm text-gray-500">items tracked</p>
            </div>
          </div>

          {/* Calories Card */}
          <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-red-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-red-100/20 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Calories</span>
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-5xl font-black text-red-600 mt-2">
                {Math.round(calorieSummary?.average || 0)}
              </p>
              <p className="text-sm text-gray-500">avg kcal</p>
            </div>
          </div>

          {/* Hydration Card */}
          <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-blue-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-blue-100/20 to-cyan-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Hydration</span>
                <Droplet className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-5xl font-black text-blue-600 mt-2">{hydrationGoal?.percentageMet || 0}%</p>
              <p className="text-sm text-gray-500">goal met</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Trend Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Calorie Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calorieChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #f97316' }}
                  formatter={(value: number) => value.toFixed(0)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Calories"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="7-Day Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Water Intake Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              Water Intake
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={waterChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: 'Glasses', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="water"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Water (glasses)"
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Daily Goal"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Macro Breakdown Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-gray-200 shadow-xl lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Macro Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: 'Grams', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #f97316' }} />
                <Legend />
                <Bar dataKey="protein" fill="#8b5cf6" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
                <Bar dataKey="fats" fill="#ec4899" name="Fats (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs */}
        {summaryData?.data?.recentLogs && summaryData.data.recentLogs.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Food Logs</h2>
            <div className="space-y-4">
              {summaryData.data.recentLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-500 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{log.totalItems} items</p>
                    <p className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
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
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 border-2 border-blue-200 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started!</h3>
            <p className="text-gray-600 mb-6">Add food to your inventory and start tracking your nutrition today</p>
            <Link href="/dashboard/inventory">
              <Button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 rounded-full font-bold">
                Go to Inventory
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
