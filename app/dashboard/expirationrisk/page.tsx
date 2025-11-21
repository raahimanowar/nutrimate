'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getExpirationRiskPredictions,
  getHighRiskItems,
  getSeasonalAlerts,
  type ExpirationRiskResponse,
  type HighRiskItemsResponse,
  type SeasonalAlertsResponse,
} from '@/lib/api/expirationRisk';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  ThermometerSun,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const ExpirationRiskPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'high-risk' | 'seasonal'>('high-risk');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch all risk predictions
  const { data: allPredictions, isLoading: loadingAll, error: errorAll, refetch: refetchAll } = useQuery<ExpirationRiskResponse>({
    queryKey: ['expirationRiskPredictions'],
    queryFn: getExpirationRiskPredictions,
    enabled: activeTab === 'all',
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  // Fetch high-risk items
  const { data: highRiskData, isLoading: loadingHighRisk, error: errorHighRisk, refetch: refetchHighRisk } = useQuery<HighRiskItemsResponse>({
    queryKey: ['highRiskItems'],
    queryFn: getHighRiskItems,
    enabled: activeTab === 'high-risk',
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  // Fetch seasonal alerts
  const { data: seasonalData, isLoading: loadingSeasonal, error: errorSeasonal, refetch: refetchSeasonal } = useQuery<SeasonalAlertsResponse>({
    queryKey: ['seasonalAlerts'],
    queryFn: getSeasonalAlerts,
    enabled: activeTab === 'seasonal',
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'red':
        return 'bg-red-50/50 border-red-400 text-red-800';
      case 'orange':
        return 'bg-red-50/50 border-red-400 text-red-800';
      case 'yellow':
        return 'bg-yellow-50/50 border-yellow-400 text-yellow-800';
      case 'green':
        return 'bg-green-50/50 border-green-400 text-green-800';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-700';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRefresh = () => {
    if (activeTab === 'all') {
      refetchAll();
      toast.success('Refreshing risk predictions...');
    } else if (activeTab === 'high-risk') {
      refetchHighRisk();
      toast.success('Refreshing high-risk items...');
    } else {
      refetchSeasonal();
      toast.success('Refreshing seasonal alerts...');
    }
  };

  const isLoading = loadingAll || loadingHighRisk || loadingSeasonal;
  const error = errorAll || errorHighRisk || errorSeasonal;

  return (
    <div className="w-full h-full p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-slate-700" />
              Expiration Risk Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered predictions to prevent food waste and save money
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('high-risk')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'high-risk'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            High Risk Items
          </div>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'all'
              ? 'text-slate-700 border-b-2 border-slate-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            All Predictions
          </div>
        </button>
        <button
          onClick={() => setActiveTab('seasonal')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'seasonal'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ThermometerSun className="w-5 h-5" />
            Seasonal Alerts
          </div>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Data</h3>
          <p className="text-red-700 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* High Risk Items Tab */}
      {activeTab === 'high-risk' && highRiskData && !isLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50/50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Critical Items</p>
                  <p className="text-3xl font-bold text-red-800 mt-1">
                    {highRiskData.data.summary.criticalItems}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">High Risk Items</p>
                  <p className="text-3xl font-bold text-yellow-800 mt-1">
                    {highRiskData.data.summary.totalHighRiskItems}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700 font-medium">Value at Risk</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">
                    tk {highRiskData.data.summary.totalValueAtRisk.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Seasonal Alerts Banner */}
          {highRiskData.data.seasonalAlerts.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ThermometerSun className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 mb-2">Seasonal Alerts</h3>
                  <div className="space-y-1">
                    {highRiskData.data.seasonalAlerts.map((alert, index) => (
                      <p key={index} className="text-sm text-blue-700">
                        {alert}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Urgent Actions */}
          {highRiskData.data.urgentActions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-red-500" />
                Urgent Actions Required
              </h2>
              <div className="space-y-3">
                {highRiskData.data.urgentActions.map((action, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(action.alertLevel)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            #{action.priority} - {action.itemName}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{action.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High Risk Items List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">High Risk Items</h2>
            
            {highRiskData.data.highRiskItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Great News!</h3>
                <p className="text-gray-600">No high-risk items found in your inventory</p>
              </div>
            ) : (
              <div className="space-y-4">
                {highRiskData.data.highRiskItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border-l-4 rounded-lg p-4 ${getAlertColor(item.alertLevel)} cursor-pointer transition-all`}
                    onClick={() => toggleItemExpansion(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadgeColor(item.alertLevel)}`}>
                            {item.alertLevel.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Category</p>
                            <p className="capitalize">{item.category}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quantity</p>
                            <p>{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <p className="font-medium">Expires In</p>
                            <p className="font-semibold text-red-700">{item.daysUntilExpiration} days</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Value</p>
                            <p>tk {item.estimatedValue.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                          <p className="text-sm font-medium mb-1">Primary Reason:</p>
                          <p className="text-sm">{item.primaryReason}</p>
                        </div>

                        {expandedItems.has(item.id) && (
                          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                            <div>
                              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Consume By: {formatDate(item.consumeBy)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Storage Tips:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {item.storageTips.map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button className="ml-4 text-gray-500 hover:text-gray-700">
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Predictions Tab */}
      {activeTab === 'all' && allPredictions && !isLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700 font-medium">Total Items</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">
                    {allPredictions.data.summary.totalItemsAnalyzed}
                  </p>
                </div>
                <Package className="w-12 h-12 text-slate-500" />
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-800 mt-1">
                    {allPredictions.data.summary.criticalAlerts}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">High Risk</p>
                  <p className="text-3xl font-bold text-yellow-800 mt-1">
                    {allPredictions.data.summary.highRiskItems}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700 font-medium">Potential Loss</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">
                    tk {allPredictions.data.summary.potentialLoss.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Location & Season Info */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <MapPin className="w-6 h-6 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Location:</span> {allPredictions.data.summary.userLocation}
                <span className="ml-4 font-semibold">Season:</span> <span className="capitalize">{allPredictions.data.summary.currentSeason}</span>
                <span className="ml-4 font-semibold">Overall Risk:</span> <span className="capitalize">{allPredictions.data.summary.overallRiskLevel}</span>
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seasonal Alerts */}
            {allPredictions.data.insights.seasonalAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-blue-500" />
                  Seasonal Alerts
                </h3>
                <div className="space-y-2">
                  {allPredictions.data.insights.seasonalAlerts.map((alert, idx) => (
                    <p key={idx} className="text-sm text-gray-700">{alert}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Consumption Tips */}
            {allPredictions.data.insights.consumptionTips.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Consumption Tips
                </h3>
                <div className="space-y-2">
                  {allPredictions.data.insights.consumptionTips.map((tip, idx) => (
                    <p key={idx} className="text-sm text-gray-700">{tip}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Waste Prevention */}
            {allPredictions.data.insights.wastePreventionStrategies.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-green-500" />
                  Waste Prevention
                </h3>
                <div className="space-y-2">
                  {allPredictions.data.insights.wastePreventionStrategies.map((strategy, idx) => (
                    <p key={idx} className="text-sm text-gray-700">{strategy}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Risk Predictions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Risk Predictions</h2>
            
            {allPredictions.data.riskPredictions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items with Expiration Dates</h3>
                <p className="text-gray-600">Add items to your inventory to see risk predictions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPredictions.data.riskPredictions.map((prediction) => (
                  <div
                    key={prediction.item.id}
                    className={`border-l-4 rounded-lg p-4 ${getAlertColor(prediction.recommendations.alertLevel)} cursor-pointer transition-all`}
                    onClick={() => toggleItemExpansion(prediction.item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{prediction.item.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadgeColor(prediction.riskAnalysis.expirationRisk)}`}>
                            {prediction.riskAnalysis.expirationRisk.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-600">
                            Priority #{prediction.recommendations.consumptionPriority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Category</p>
                            <p className="capitalize">{prediction.item.category}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quantity</p>
                            <p>{prediction.item.quantity} {prediction.item.unit}</p>
                          </div>
                          <div>
                            <p className="font-medium">Expires In</p>
                            <p className="font-semibold">{prediction.item.daysUntilExpiration} days</p>
                          </div>
                          <div>
                            <p className="font-medium">Risk Score</p>
                            <p>{prediction.riskAnalysis.overallRiskScore}/100</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Value</p>
                            <p>tk {prediction.item.estimatedValue.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                          <p className="text-sm font-medium mb-1">Primary Reason:</p>
                          <p className="text-sm">{prediction.reasoning.primaryReason}</p>
                        </div>

                        {expandedItems.has(prediction.item.id) && (
                          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                            <div>
                              <p className="font-semibold text-sm mb-2">Contributing Factors:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {prediction.reasoning.contributingFactors.map((factor, idx) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="font-semibold text-sm mb-2">Seasonality Impact:</p>
                              <p className="text-sm">{prediction.reasoning.seasonalityImpact}</p>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Storage Tips:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {prediction.recommendations.storageTips.map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="font-semibold text-sm mb-2">Alternative Uses:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {prediction.recommendations.alternativeUses.map((use, idx) => (
                                  <li key={idx}>{use}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button className="ml-4 text-gray-500 hover:text-gray-700">
                        {expandedItems.has(prediction.item.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seasonal Alerts Tab */}
      {activeTab === 'seasonal' && seasonalData && !isLoading && (
        <div className="space-y-6">
          {/* Season Info Banner */}
          <div className="bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-lg p-6">
            <div className="flex items-center gap-4">
              <ThermometerSun className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold capitalize">{seasonalData.data.currentSeason} Season</h2>
                <p className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {seasonalData.data.userLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Seasonal Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-500" />
                Seasonal Alerts
              </h2>
              <div className="space-y-3">
                {seasonalData.data.seasonalAlerts.map((alert, index) => (
                  <div key={index} className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800">{alert}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Affected Categories</h2>
            <div className="flex flex-wrap gap-2">
              {seasonalData.data.affectedCategories.map((category, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Seasonal Tips */}
          {seasonalData.data.seasonalTips.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-green-500" />
                Seasonal Tips
              </h2>
              <div className="space-y-3">
                {seasonalData.data.seasonalTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-gray-800">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High Risk Seasonal Items */}
          {seasonalData.data.highRiskSeasonalItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">High Risk Seasonal Items</h2>
              <div className="space-y-4">
                {seasonalData.data.highRiskSeasonalItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(item.alertLevel)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <span className="text-sm text-gray-600 capitalize">({item.category})</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{item.seasonalityImpact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpirationRiskPage;