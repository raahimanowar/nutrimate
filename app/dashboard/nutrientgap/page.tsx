'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getNutrientGapPrediction,
  getNutrientDeficiencies,
  getFoodSuggestions,
  getMealSuggestions,
  getNutritionInsights,
  NutrientGapPrediction,
  NutrientDeficienciesResponse,
  FoodSuggestionsResponse,
  MealSuggestionsResponse,
  NutritionInsightsResponse
} from '@/lib/api/nutrientGap';
import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Apple,
  UtensilsCrossed,
  Lightbulb,
  Calendar,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

type TabType = 'overview' | 'deficiencies' | 'foods' | 'meals' | 'insights';

const Nutrientgappage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analysisDays, setAnalysisDays] = useState(30);
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // Fetch comprehensive prediction
  const { data: predictionData, isLoading: loadingPrediction } = useQuery<NutrientGapPrediction>({
    queryKey: ['nutrientGap', analysisDays],
    queryFn: () => getNutrientGapPrediction(analysisDays),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Fetch deficiencies
  const { data: deficienciesData, isLoading: loadingDeficiencies } = useQuery<NutrientDeficienciesResponse>({
    queryKey: ['nutrientDeficiencies', analysisDays],
    queryFn: () => getNutrientDeficiencies(analysisDays, 'moderate'),
    enabled: activeTab === 'deficiencies',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch food suggestions
  const { data: foodData, isLoading: loadingFoods } = useQuery<FoodSuggestionsResponse>({
    queryKey: ['foodSuggestions', analysisDays],
    queryFn: () => getFoodSuggestions(analysisDays, 'high', 'all'),
    enabled: activeTab === 'foods',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch meal suggestions
  const { data: mealData, isLoading: loadingMeals } = useQuery<MealSuggestionsResponse>({
    queryKey: ['mealSuggestions', analysisDays],
    queryFn: () => getMealSuggestions(analysisDays),
    enabled: activeTab === 'meals',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch insights
  const { data: insightsData, isLoading: loadingInsights } = useQuery<NutritionInsightsResponse>({
    queryKey: ['nutritionInsights', analysisDays],
    queryFn: () => getNutritionInsights(analysisDays),
    enabled: activeTab === 'insights',
    staleTime: 5 * 60 * 1000,
  });

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'severe': return 'bg-red-50 border-red-200 text-red-900';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'mild': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default: return 'bg-green-50 border-green-200 text-green-900';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'severe': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'moderate': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'mild': return <Info className="w-5 h-5 text-yellow-600" />;
      default: return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worsening': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'in_inventory':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">In Stock</span>;
      case 'in_catalog':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Available</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Out of Stock</span>;
    }
  };

  if (loadingPrediction) {
    return <LoadingSpinner message="Analyzing your nutrient intake..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nutrient Gap Analysis
            </h1>
            <p className="text-gray-600 mt-2">AI-powered nutritional deficiency detection and recommendations</p>
          </div>

          {/* Analysis Period Selector */}
          <select
            value={analysisDays}
            onChange={(e) => setAnalysisDays(Number(e.target.value))}
            className="px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-semibold"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>

        {/* Summary Cards */}
        {predictionData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border-2 border-purple-100 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Nutrition Score</p>
                  <p className="text-3xl font-black text-purple-600 mt-2">
                    {predictionData.summary.overallNutritionScore}%
                  </p>
                </div>
                <Activity className="w-12 h-12 text-purple-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-orange-100 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Deficiencies</p>
                  <p className="text-3xl font-black text-orange-600 mt-2">
                    {predictionData.summary.totalDeficiencies}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-100 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Severe Issues</p>
                  <p className="text-3xl font-black text-red-600 mt-2">
                    {predictionData.summary.severeDeficiencies}
                  </p>
                </div>
                <XCircle className="w-12 h-12 text-red-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-100 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Data Quality</p>
                  <p className="text-3xl font-black text-green-600 mt-2">
                    {Math.round(predictionData.summary.dataCompleteness)}%
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-300" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border-2 border-purple-100 shadow-lg overflow-hidden">
          <div className="flex border-b-2 border-purple-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Overview
              </div>
            </button>

            <button
              onClick={() => setActiveTab('deficiencies')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'deficiencies'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Deficiencies
              </div>
            </button>

            <button
              onClick={() => setActiveTab('foods')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'foods'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                Food Suggestions
              </div>
            </button>

            <button
              onClick={() => setActiveTab('meals')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'meals'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                Meal Plans
              </div>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'insights'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Insights
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && predictionData && (
              <div className="space-y-6">
                {/* Key Findings */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Key Findings
                  </h3>
                  <ul className="space-y-2">
                    {predictionData.insights.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-800">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrient Analysis */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrient Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictionData.nutrientAnalysis.map((nutrient, idx) => (
                      <div
                        key={idx}
                        className={`border-2 rounded-xl p-4 ${getSeverityColor(nutrient.deficiencyLevel)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(nutrient.deficiencyLevel)}
                            <h4 className="font-bold">{nutrient.nutrientName}</h4>
                          </div>
                          {getTrendIcon(nutrient.trend)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current:</span>
                            <span className="font-semibold">{nutrient.currentIntake.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Recommended:</span>
                            <span className="font-semibold">{nutrient.recommendedIntake.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Gap:</span>
                            <span className="font-semibold">{nutrient.deficiencyPercentage.toFixed(0)}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full ${
                                nutrient.deficiencyLevel === 'none' ? 'bg-green-600' :
                                nutrient.deficiencyLevel === 'mild' ? 'bg-yellow-600' :
                                nutrient.deficiencyLevel === 'moderate' ? 'bg-orange-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(100, (nutrient.currentIntake / nutrient.recommendedIntake) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Recommendations */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Priority Actions</h3>
                  <ul className="space-y-2">
                    {predictionData.insights.priorityActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-blue-800">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Deficiencies Tab */}
            {activeTab === 'deficiencies' && (
              <div className="space-y-4">
                {loadingDeficiencies ? (
                  <LoadingSpinner message="Loading deficiencies..." />
                ) : deficienciesData ? (
                  <>
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="font-bold text-orange-900">
                            {deficienciesData.data.summary.filteredDeficiencies} Deficiencies Detected
                          </p>
                          <p className="text-sm text-orange-700">
                            {deficienciesData.data.summary.priorityDeficiencies} require immediate attention
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {deficienciesData.data.nutrientAnalysis.map((nutrient, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedNutrient(expandedNutrient === nutrient.nutrientName ? null : nutrient.nutrientName)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-4">
                              {getSeverityIcon(nutrient.deficiencyLevel)}
                              <div className="text-left">
                                <h4 className="font-bold text-gray-900">{nutrient.nutrientName}</h4>
                                <p className="text-sm text-gray-600">
                                  {nutrient.deficiencyPercentage.toFixed(0)}% below recommended
                                </p>
                              </div>
                            </div>
                            {expandedNutrient === nutrient.nutrientName ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>

                          {expandedNutrient === nutrient.nutrientName && (
                            <div className="p-4 border-t-2 border-gray-100 bg-gray-50 space-y-4">
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Health Implications</h5>
                                <ul className="space-y-1">
                                  {nutrient.healthImplications.map((implication, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-red-500 mt-1">•</span>
                                      {implication}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Food Sources</h5>
                                <div className="flex flex-wrap gap-2">
                                  {nutrient.foodSources.map((food, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                      {food}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No deficiency data available</p>
                  </div>
                )}
              </div>
            )}

            {/* Food Suggestions Tab */}
            {activeTab === 'foods' && (
              <div className="space-y-4">
                {loadingFoods ? (
                  <LoadingSpinner message="Loading food suggestions..." />
                ) : foodData ? (
                  <>
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Total Suggestions</p>
                          <p className="text-2xl font-bold text-green-900">{foodData.data.summary.filteredSuggestions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium">In Inventory</p>
                          <p className="text-2xl font-bold text-green-900">{foodData.data.summary.inventoryItems}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium">Est. Cost</p>
                          <p className="text-2xl font-bold text-green-900">৳{foodData.data.summary.totalEstimatedCost.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {foodData.data.foodSuggestions.map((food, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{food.foodName}</h4>
                              <p className="text-sm text-gray-600">{food.category} • {food.servingSize}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getAvailabilityBadge(food.availability)}
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(food.priority)}`}>
                                {food.priority}
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Nutrients Provided:</p>
                            <div className="space-y-1">
                              {food.nutrientsProvided.map((nutrient, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{nutrient.nutrientName}</span>
                                  <span className="font-semibold text-green-700">
                                    {nutrient.amount.toFixed(1)} ({nutrient.percentOfDeficiency.toFixed(0)}% of gap)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <DollarSign className="w-4 h-4" />
                              <span>৳{food.estimatedCost.toFixed(0)}</span>
                            </div>
                            {food.availability === 'in_inventory' && (
                              <span className="text-xs text-green-600 font-semibold">Available Now!</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No food suggestions available</p>
                  </div>
                )}
              </div>
            )}

            {/* Meal Suggestions Tab */}
            {activeTab === 'meals' && (
              <div className="space-y-4">
                {loadingMeals ? (
                  <LoadingSpinner message="Loading meal plans..." />
                ) : mealData ? (
                  <>
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-indigo-700 font-medium">Total Meals</p>
                          <p className="text-2xl font-bold text-indigo-900">{mealData.data.summary.filteredMeals}</p>
                        </div>
                        <div>
                          <p className="text-sm text-indigo-700 font-medium">Meal Types</p>
                          <p className="text-2xl font-bold text-indigo-900">{mealData.data.summary.mealTypesAvailable.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-indigo-700 font-medium">Est. Cost</p>
                          <p className="text-2xl font-bold text-indigo-900">৳{mealData.data.summary.totalEstimatedCost.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {mealData.data.mealSuggestions.map((meal, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedMeal(expandedMeal === meal.mealName ? null : meal.mealName)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-4">
                              <UtensilsCrossed className="w-6 h-6 text-indigo-600" />
                              <div className="text-left">
                                <h4 className="font-bold text-gray-900">{meal.mealName}</h4>
                                <p className="text-sm text-gray-600">{meal.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">
                                    {meal.mealType}
                                  </span>
                                  <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {meal.preparationTime}
                                  </span>
                                  <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ৳{meal.estimatedCost.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {expandedMeal === meal.mealName ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>

                          {expandedMeal === meal.mealName && (
                            <div className="p-4 border-t-2 border-gray-100 bg-gray-50 space-y-4">
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Ingredients</h5>
                                <ul className="space-y-1">
                                  {meal.ingredients.map((ingredient, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                      <span><strong>{ingredient.name}</strong> - {ingredient.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Preparation Steps</h5>
                                <ol className="space-y-2">
                                  {meal.preparationSteps.map((step, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                                      <span className="font-bold text-indigo-600">{i + 1}.</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Nutrients Targeted</h5>
                                <div className="flex flex-wrap gap-2">
                                  {meal.nutrientsTargeted.map((nutrient, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                      {nutrient}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No meal suggestions available</p>
                  </div>
                )}
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {loadingInsights ? (
                  <LoadingSpinner message="Loading insights..." />
                ) : insightsData ? (
                  <>
                    {/* Action Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Immediate Actions
                        </h3>
                        <ul className="space-y-2">
                          {insightsData.data.actionPlan.immediateActions.map((action, idx) => (
                            <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                              <span className="text-red-600 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Weekly Goals
                        </h3>
                        <ul className="space-y-2">
                          {insightsData.data.actionPlan.weeklyGoals.map((goal, idx) => (
                            <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Long-term Health
                        </h3>
                        <ul className="space-y-2">
                          {insightsData.data.actionPlan.longTermHealth.map((tip, idx) => (
                            <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Health Impact */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Health Impact Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            Current Risks
                          </h4>
                          <ul className="space-y-2">
                            {insightsData.data.healthImpact.currentRisks.map((risk, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-red-500 mt-1">⚠</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Prevention Tips
                          </h4>
                          <ul className="space-y-2">
                            {insightsData.data.healthImpact.preventionTips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Priority Nutrients */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-purple-900 mb-4">Priority Nutrients to Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insightsData.data.priorityNutrients.map((nutrient, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border-2 border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">{nutrient.nutrientName}</h4>
                              {getSeverityIcon(nutrient.deficiencyLevel)}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gap:</span>
                                <span className="font-semibold text-purple-700">
                                  {nutrient.deficiencyPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Trend:</span>
                                <span className="flex items-center gap-1">
                                  {getTrendIcon(nutrient.trend)}
                                  <span className="capitalize">{nutrient.trend}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No insights available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrientgappage;