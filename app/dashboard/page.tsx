"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Package, TrendingUp, Apple, Lightbulb, AlertCircle } from 'lucide-react';

interface InventorySummary {
  inventoryCount: number;
}

interface RecentLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
}

interface RecommendedResource {
  title: string;
  url: string;
  relatedTo: string;
}

interface TrackingSummaryResponse {
  success: boolean;
  message: string;
  data: {
    inventoryCount: number;
    recentLogs: RecentLog[];
    recommendedResources: RecommendedResource[];
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch tracking summary
const fetchTrackingSummary = async (): Promise<TrackingSummaryResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/tracking/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const DashboardPage = () => {
  const { data: trackingData, isLoading, error } = useQuery({
    queryKey: ['trackingSummary'],
    queryFn: fetchTrackingSummary,
  });

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

  if (error || !trackingData?.data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700">{(error as Error)?.message || 'Failed to load tracking data'}</p>
        </div>
      </div>
    );
  }

  const { inventoryCount, recentLogs, recommendedResources } = trackingData.data;

  return (
    <div className="space-y-8 py-8 px-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your nutrition and inventory at a glance</p>
        </div>
        <div className="text-6xl opacity-20">📊</div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Items */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-100/40 via-transparent to-amber-100/40 pointer-events-none"></div>
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Inventory Items</p>
                <p className="text-5xl font-black text-orange-600 mt-2">{inventoryCount}</p>
              </div>
              <div className="p-3 bg-linear-to-br from-orange-200 to-amber-200 rounded-xl">
                <Package className="w-8 h-8 text-orange-700" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Items being tracked</span>
            </div>
          </div>
        </div>

        {/* Total Nutrition */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-100/40 via-transparent to-pink-100/40 pointer-events-none"></div>
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Nutrition Today</p>
                <p className="text-5xl font-black text-purple-600 mt-2">
                  {recentLogs.length > 0 ? recentLogs[0].totalCalories : 0}
                </p>
              </div>
              <div className="p-3 bg-linear-to-br from-purple-200 to-pink-200 rounded-xl">
                <Apple className="w-8 h-8 text-purple-700" />
              </div>
            </div>
            <p className="text-sm text-purple-600 font-semibold">
              {recentLogs.length > 0 ? `${recentLogs[0].totalProtein}g Protein` : 'No logs today'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Logs Chart-like Display */}
      {recentLogs.length > 0 && (
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-100/40 via-transparent to-pink-100/40 pointer-events-none"></div>
          <div className="relative p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              Last 7 Days Activity
            </h2>
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700 min-w-[100px]">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Calories</span>
                          <p className="font-bold text-orange-600">{log.totalCalories}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Protein</span>
                          <p className="font-bold text-purple-600">{log.totalProtein}g</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-orange-500 to-amber-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((log.totalCalories / 2500) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {log.totalCalories} / 2500 calories
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      

      {/* Empty State */}
      {inventoryCount === 0 && recentLogs.length === 0 && (
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden text-center p-12">
          <div className="absolute inset-0 bg-linear-to-br from-orange-100/40 via-transparent to-amber-100/40 pointer-events-none"></div>
          <div className="relative">
            <p className="text-6xl mb-4">📭</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Add items to your inventory or start logging your daily meals to see your dashboard populate!
            </p>
            <Link
              href="/dashboard/inventory"
              className="inline-block px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Go to Inventory →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
