'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWasteEstimation, WasteEstimationResponse } from '@/lib/api/waste';
import { useUserInfo } from '@/lib/context/UserContext';
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Award,
  Target,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

const WasteestimationPage = () => {
  const { user } = useUserInfo();

  // Fetch waste estimation
  const { data: wasteData, isLoading } = useQuery<WasteEstimationResponse>({
    queryKey: ['wasteEstimation', user?.username],
    queryFn: () => {
      if (!user?.username) throw new Error('User not authenticated');
      return getWasteEstimation(user.username);
    },
    enabled: !!user?.username,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const getComparisonStatus = (userValue: number, communityValue: number) => {
    const percentage = ((userValue - communityValue) / communityValue) * 100;
    if (percentage < -10) {
      return {
        status: 'excellent',
        message: 'Way below average! 🌟',
        icon: <Award className="w-5 h-5 text-green-600" />,
        color: 'text-green-600',
      };
    } else if (percentage < 0) {
      return {
        status: 'good',
        message: 'Below average ✓',
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        color: 'text-blue-600',
      };
    } else if (percentage < 20) {
      return {
        status: 'average',
        message: 'Near average',
        icon: <Target className="w-5 h-5 text-orange-600" />,
        color: 'text-orange-600',
      };
    } else {
      return {
        status: 'high',
        message: 'Above average ⚠',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        color: 'text-red-600',
      };
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating waste estimation..." fullScreen />;
  }

  if (!wasteData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No waste data available</p>
          </div>
        </div>
      </div>
    );
  }

  const weeklyComparison = getComparisonStatus(wasteData.weeklyWasted, wasteData.community.weekly_avg);
  const monthlyComparison = getComparisonStatus(wasteData.monthlyWasted, wasteData.community.monthly_avg);

  const weeklySavings = Math.max(0, wasteData.community.weekly_avg - wasteData.weeklyWasted);
  const monthlySavings = Math.max(0, wasteData.community.monthly_avg - wasteData.monthlyWasted);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Food Waste Estimation
          </h1>
          <p className="text-gray-600 mt-2">Track and reduce your food waste to save money and help the environment</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Waste */}
          <div className="bg-white rounded-xl border-2 border-red-100 shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-red-500 to-orange-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Weekly Waste</h2>
                </div>
                {weeklyComparison.icon}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Your Waste</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-red-600">৳{wasteData.weeklyWasted.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">/ week</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Community Average</p>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-700">৳{wasteData.community.weekly_avg.toFixed(0)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${weeklyComparison.color}`}>
                    {weeklyComparison.message}
                  </span>
                  {weeklySavings > 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-semibold">-৳{weeklySavings.toFixed(0)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">+৳{Math.abs(weeklySavings).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Waste */}
          <div className="bg-white rounded-xl border-2 border-orange-100 shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-orange-500 to-amber-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Monthly Waste</h2>
                </div>
                {monthlyComparison.icon}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Your Waste</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-orange-600">৳{wasteData.monthlyWasted.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">/ month</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Community Average</p>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-700">৳{wasteData.community.monthly_avg.toFixed(0)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${monthlyComparison.color}`}>
                    {monthlyComparison.message}
                  </span>
                  {monthlySavings > 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-semibold">-৳{monthlySavings.toFixed(0)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">+৳{Math.abs(monthlySavings).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environmental Impact */}
          <div className="bg-white rounded-xl border-2 border-green-100 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-green-600" />
              Environmental Impact
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">Weekly CO₂ Equivalent</p>
                <p className="text-2xl font-bold text-green-900">
                  {(wasteData.weeklyWasted * 0.002).toFixed(2)} kg
                </p>
                <p className="text-xs text-green-700 mt-1">Based on food waste carbon footprint</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">Monthly CO₂ Equivalent</p>
                <p className="text-2xl font-bold text-green-900">
                  {(wasteData.monthlyWasted * 0.002).toFixed(2)} kg
                </p>
                <p className="text-xs text-green-700 mt-1">Reducing waste helps fight climate change</p>
              </div>
            </div>
          </div>

          {/* Money Saved Potential */}
          <div className="bg-white rounded-xl border-2 border-blue-100 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Savings Potential
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">Potential Annual Savings</p>
                <p className="text-3xl font-bold text-blue-900">
                  ৳{(wasteData.community.monthly_avg * 12 - wasteData.monthlyWasted * 12).toFixed(0)}
                </p>
                <p className="text-xs text-blue-700 mt-1">If you reduce waste to zero</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-800 mb-2">Current Annual Waste</p>
                <p className="text-3xl font-bold text-amber-900">
                  ৳{(wasteData.monthlyWasted * 12).toFixed(0)}
                </p>
                <p className="text-xs text-amber-700 mt-1">Money lost to food waste yearly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips to Reduce Waste */}
        <div className="bg-white rounded-xl border-2 border-purple-100 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Tips to Reduce Food Waste
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Plan Your Meals</h4>
                  <p className="text-sm text-purple-700">Create weekly meal plans to buy only what you need</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">First In, First Out</h4>
                  <p className="text-sm text-purple-700">Use older items before newer ones to prevent spoilage</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Proper Storage</h4>
                  <p className="text-sm text-purple-700">Store food correctly to extend shelf life</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Smaller Portions</h4>
                  <p className="text-sm text-purple-700">Serve smaller portions and go for seconds if needed</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Use Leftovers</h4>
                  <p className="text-sm text-purple-700">Get creative with leftover ingredients in new recipes</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Track Expiration</h4>
                  <p className="text-sm text-purple-700">Use the expiration risk feature to monitor items</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        {weeklyComparison.status === 'excellent' && (
          <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <Award className="w-16 h-16" />
              <div>
                <h3 className="text-2xl font-bold mb-1">Waste Reduction Champion! 🏆</h3>
                <p className="text-green-100">
                  You&apos;re doing an amazing job reducing food waste! Your efforts are saving money and helping the environment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteestimationPage;