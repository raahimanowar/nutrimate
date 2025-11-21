'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  getMealOptimization,
  getBudgetAnalysis,
  getNutritionalRecommendations,
  type MealOptimizationRequest,
  type MealOptimizationResponse,
  type BudgetAnalysisResponse,
  type NutritionalRecommendationsResponse,
} from '@/lib/api/mealOptimizer';
import {
  Sparkles,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Utensils,
  Apple,
  Leaf,
  CheckCircle,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useUserInfo } from '@/lib/context/UserContext';

const MealOptimizerPage = () => {
  const { user } = useUserInfo();
  const [activeTab, setActiveTab] = useState<'optimize' | 'budget' | 'nutrition'>('optimize');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());

  // Form states - will be updated when user data loads
  const [optimizationForm, setOptimizationForm] = useState<MealOptimizationRequest>({
    budget: 200,
    dietaryRestrictions: [],
    preferences: [],
    familySize: 1,
    weeklyBudget: false,
  });

  const [budgetForm, setBudgetForm] = useState({
    budget: 200,
    familySize: 1,
    weeklyBudget: false,
  });

  const [nutritionFilters, setNutritionFilters] = useState({
    categories: [] as string[],
    budget: undefined as number | undefined,
  });

  // Results states
  const [optimizationResult, setOptimizationResult] = useState<MealOptimizationResponse | null>(null);
  const [budgetAnalysisResult, setBudgetAnalysisResult] = useState<BudgetAnalysisResponse | null>(null);
  const [nutritionResult, setNutritionResult] = useState<NutritionalRecommendationsResponse | null>(null);

  // Track if we've populated from user profile
  const [hasPopulatedFromProfile, setHasPopulatedFromProfile] = useState(false);

  // Populate forms from user profile when available (runs once when user data loads)
  useEffect(() => {
    if (user && !hasPopulatedFromProfile) {
      const userBudget = user.budgetPreferences?.spendingCategories?.groceries || 
                         user.budgetPreferences?.monthlyBudget || 
                         200;
      
      const userDietaryRestrictions: string[] = [];
      if (user.dietaryNeeds?.allergies) {
        userDietaryRestrictions.push(...user.dietaryNeeds.allergies);
      }
      if (user.dietaryNeeds?.avoidIngredients) {
        userDietaryRestrictions.push(...user.dietaryNeeds.avoidIngredients);
      }
      
      const userFamilySize = user.householdSize || 1;
      
      // Initialize forms with user profile data (one-time initialization from external source)
      // The guard `hasPopulatedFromProfile` ensures this only runs once, so no cascading renders
      // eslint-disable-next-line
      setOptimizationForm({
        budget: userBudget,
        dietaryRestrictions: userDietaryRestrictions,
        preferences: [],
        familySize: userFamilySize,
        weeklyBudget: false,
      });
      
      setBudgetForm({
        budget: userBudget,
        familySize: userFamilySize,
        weeklyBudget: false,
      });
      
      setNutritionFilters({
        categories: [],
        budget: userBudget,
      });
      
      setHasPopulatedFromProfile(true);
    }
  }, [user, hasPopulatedFromProfile]);

  // Mutations
  const optimizeMutation = useMutation({
    mutationFn: getMealOptimization,
    onSuccess: (data) => {
      setOptimizationResult(data);
      toast.success('Meal optimization completed! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to optimize meals');
    },
  });

  const budgetMutation = useMutation({
    mutationFn: getBudgetAnalysis,
    onSuccess: (data) => {
      setBudgetAnalysisResult(data);
      toast.success('Budget analysis completed! 💰');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to analyze budget');
    },
  });

  const nutritionQuery = useMutation({
    mutationFn: () => getNutritionalRecommendations(nutritionFilters.categories, nutritionFilters.budget),
    onSuccess: (data) => {
      setNutritionResult(data);
      toast.success('Nutritional recommendations loaded! 🥗');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to get recommendations');
    },
  });

  const categories = ['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-sodium'];
  const preferenceOptions = ['organic', 'low-sodium', 'non-gmo', 'local', 'seasonal'];

  const toggleRecommendation = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  const handleOptimize = () => {
    optimizeMutation.mutate(optimizationForm);
  };

  const handleBudgetAnalysis = () => {
    budgetMutation.mutate(budgetForm);
  };

  const handleNutritionSearch = () => {
    nutritionQuery.mutate();
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = optimizationForm.dietaryRestrictions || [];
    if (current.includes(restriction)) {
      setOptimizationForm({
        ...optimizationForm,
        dietaryRestrictions: current.filter((r) => r !== restriction),
      });
    } else {
      setOptimizationForm({
        ...optimizationForm,
        dietaryRestrictions: [...current, restriction],
      });
    }
  };

  const togglePreference = (preference: string) => {
    const current = optimizationForm.preferences || [];
    if (current.includes(preference)) {
      setOptimizationForm({
        ...optimizationForm,
        preferences: current.filter((p) => p !== preference),
      });
    } else {
      setOptimizationForm({
        ...optimizationForm,
        preferences: [...current, preference],
      });
    }
  };

  const toggleNutritionCategory = (category: string) => {
    const current = nutritionFilters.categories;
    if (current.includes(category)) {
      setNutritionFilters({
        ...nutritionFilters,
        categories: current.filter((c) => c !== category),
      });
    } else {
      setNutritionFilters({
        ...nutritionFilters,
        categories: [...current, category],
      });
    }
  };

  return (
    <div className="w-full h-full p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-orange-600" />
          Meal Optimizer
        </h1>
        <p className="text-gray-600 mt-2">
          AI-powered meal planning with budget optimization and nutritional analysis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('optimize')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'optimize'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Optimization
          </div>
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'budget'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Analysis
          </div>
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'nutrition'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            Nutrition Recommendations
          </div>
        </button>
      </div>

      {/* AI Optimization Tab */}
      {activeTab === 'optimize' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Optimization Settings</h2>
            
            {hasPopulatedFromProfile && user && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Form pre-filled with your profile data: Budget (tk {optimizationForm.budget}), Family Size ({optimizationForm.familySize})
                  {optimizationForm.dietaryRestrictions && optimizationForm.dietaryRestrictions.length > 0 && `, Dietary Restrictions (${optimizationForm.dietaryRestrictions.length})`}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (tk)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={optimizationForm.budget}
                  onChange={(e) =>
                    setOptimizationForm({ ...optimizationForm, budget: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Family Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={optimizationForm.familySize}
                  onChange={(e) =>
                    setOptimizationForm({ ...optimizationForm, familySize: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Weekly Budget Toggle */}
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optimizationForm.weeklyBudget}
                  onChange={(e) =>
                    setOptimizationForm({ ...optimizationForm, weeklyBudget: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">This is a weekly budget</span>
              </label>
            </div>

            {/* Dietary Restrictions */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleDietaryRestriction(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      optimizationForm.dietaryRestrictions?.includes(option)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => togglePreference(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      optimizationForm.preferences?.includes(option)
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending}
              className="mt-6 w-full bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {optimizeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Optimize Meals
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {optimizationResult && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-900">
                        tk {optimizationResult.data.summary.totalBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Allocated</p>
                      <p className="text-2xl font-bold text-gray-900">
                        tk {optimizationResult.data.summary.allocatedBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">
                        tk {optimizationResult.data.summary.remainingBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {optimizationResult.data.summary.itemsRecommended}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Insights</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700">
                      <strong>Budget Optimization:</strong> {optimizationResult.data.insights.budgetOptimization}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Nutritional Focus:</strong> {optimizationResult.data.insights.nutritionalFocus}
                    </p>
                  </div>
                  {optimizationResult.data.insights.costSavingTips.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Cost Saving Tips:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {optimizationResult.data.insights.costSavingTips.map((tip, idx) => (
                          <li key={idx} className="text-gray-700">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {optimizationResult.data.insights.mealPlanningSuggestions.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Meal Planning Suggestions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {optimizationResult.data.insights.mealPlanningSuggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-700">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Items</h3>
                <div className="space-y-3">
                  {optimizationResult.data.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleRecommendation(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                rec.urgency === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : rec.urgency === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {rec.urgency}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{rec.item.name}</p>
                              <p className="text-sm text-gray-600">
                                {rec.item.quantity} {rec.item.unit} • tk {rec.item.totalCost.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {rec.item.category}
                            </span>
                            {expandedRecommendations.has(index) ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedRecommendations.has(index) && (
                        <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Reason:</p>
                            <p className="text-sm text-gray-700">{rec.item.reason}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Nutritional Value:</p>
                            <p className="text-sm text-gray-700">{rec.item.nutritionalValue}</p>
                          </div>
                          {rec.item.alternativeOptions.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Alternatives:</p>
                              <p className="text-sm text-gray-700">
                                {rec.item.alternativeOptions.join(', ')}
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-600">Cost per unit</p>
                              <p className="text-sm font-semibold">tk {rec.item.costPerUnit.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Budget Impact</p>
                              <p className="text-sm font-semibold">{rec.budgetImpact.percentageUsed.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget Analysis Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (tk)</label>
                <input
                  type="number"
                  min="0"
                  value={budgetForm.budget}
                  onChange={(e) => setBudgetForm({ ...budgetForm, budget: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                <input
                  type="number"
                  min="1"
                  value={budgetForm.familySize}
                  onChange={(e) => setBudgetForm({ ...budgetForm, familySize: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetForm.weeklyBudget}
                    onChange={(e) => setBudgetForm({ ...budgetForm, weeklyBudget: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Weekly Budget</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleBudgetAnalysis}
              disabled={budgetMutation.isPending}
              className="mt-6 w-full bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              {budgetMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Analyze Budget
                </>
              )}
            </button>
          </div>

          {budgetAnalysisResult && (
            <div className="space-y-6">
              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    tk {budgetAnalysisResult.data.budget.total.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Weekly</p>
                  <p className="text-2xl font-bold text-gray-900">
                    tk {budgetAnalysisResult.data.budget.weekly.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    tk {budgetAnalysisResult.data.budget.allocated.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    tk {budgetAnalysisResult.data.budget.remaining.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Current Inventory */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Current Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {budgetAnalysisResult.data.currentInventory.totalItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      tk {budgetAnalysisResult.data.currentInventory.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(budgetAnalysisResult.data.currentInventory.categories).map(
                        ([category, count]) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                          >
                            {category}: {count}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Allocation */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Budget Allocation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(budgetAnalysisResult.data.recommendations.suggestedAllocation).map(
                    ([category, amount]) => (
                      <div key={category} className="text-center">
                        <p className="text-sm text-gray-600 capitalize mb-1">{category}</p>
                        <p className="text-lg font-bold text-orange-600">tk {(amount as number).toFixed(2)}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Budget Utilization</p>
                    <p className="text-blue-800">
                      {budgetAnalysisResult.data.recommendations.budgetUtilization}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nutrition Recommendations Tab */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nutritional Recommendations</h2>

            <div className="space-y-6">
              {/* Categories Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleNutritionCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        nutritionFilters.categories.includes(category)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={nutritionFilters.budget || ''}
                  onChange={(e) =>
                    setNutritionFilters({
                      ...nutritionFilters,
                      budget: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Enter budget"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleNutritionSearch}
                disabled={nutritionQuery.isPending}
                className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
              >
                {nutritionQuery.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Leaf className="w-5 h-5" />
                    Get Recommendations
                  </>
                )}
              </button>
            </div>
          </div>

          {nutritionResult && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {nutritionResult.data.summary.totalItems || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    tk {(nutritionResult.data.summary.totalCost || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Average Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    tk {(nutritionResult.data.summary.averageCost || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {nutritionResult.data.summary.categories?.length || 0}
                  </p>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Foods</h3>
                {nutritionResult.data.recommendations && nutritionResult.data.recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nutritionResult.data.recommendations.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                            Score: {item.nutritionalScore}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize mb-2">{item.category}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">tk {(item.costPerUnit || 0).toFixed(2)}</span>
                          <span className="text-gray-500">{item.expirationDays || 0} days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No recommendations found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealOptimizerPage;