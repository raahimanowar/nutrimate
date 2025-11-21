'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getSDGScore,
  getSDGTrends,
  getEnvironmentalImpact,
  SDGScoreResponse,
  SDGTrendsResponse,
  EnvironmentalImpactResponse
} from '@/lib/api/sdgImpact';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Leaf,
  Droplets,
  Award,
  Zap,
  Heart,
  Recycle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Trophy,
  Star
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

type TabType = 'overview' | 'trends' | 'actions' | 'environmental' | 'achievements';

const Sdgimpactpage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analysisDays, setAnalysisDays] = useState(30);
  const [comparisonPeriod, setComparisonPeriod] = useState(7);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Fetch SDG Score
  const { data: scoreData, isLoading: loadingScore } = useQuery<SDGScoreResponse>({
    queryKey: ['sdgScore', analysisDays, comparisonPeriod],
    queryFn: () => getSDGScore(analysisDays, comparisonPeriod),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Fetch SDG Trends
  const { data: trendsData, isLoading: loadingTrends } = useQuery<SDGTrendsResponse>({
    queryKey: ['sdgTrends', analysisDays, comparisonPeriod],
    queryFn: () => getSDGTrends(analysisDays, comparisonPeriod),
    enabled: activeTab === 'trends',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Environmental Impact
  const { data: environmentalData, isLoading: loadingEnvironmental } = useQuery<EnvironmentalImpactResponse>({
    queryKey: ['environmentalImpact', analysisDays, comparisonPeriod],
    queryFn: () => getEnvironmentalImpact(analysisDays, comparisonPeriod),
    enabled: activeTab === 'environmental',
    staleTime: 5 * 60 * 1000,
  });

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    if (score >= 21) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 81) return 'bg-green-50 border-green-200';
    if (score >= 61) return 'bg-blue-50 border-blue-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    if (score >= 21) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getRankingIcon = (ranking: string) => {
    switch (ranking.toLowerCase()) {
      case 'excellent': return '🌟';
      case 'good': return '✨';
      case 'moderate': return '📈';
      case 'needs improvement': return '⚠️';
      default: return '🔄';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (!trend) return <Minus className="w-4 h-4 text-gray-600" />;
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'declining' || trend === 'worsening') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe.toLowerCase()) {
      case 'immediate': return 'bg-red-50 border-red-200';
      case 'week': return 'bg-orange-50 border-orange-200';
      case 'month': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loadingScore) {
    return <LoadingSpinner message="Calculating your SDG impact..." fullScreen />;
  }

  if (!scoreData?.data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No SDG impact data available. Start logging your daily meals!</p>
        </div>
      </div>
    );
  }

  const { summary, sdgScores, weeklyInsights, actionableSteps, impactMetrics, achievements } = scoreData.data;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              SDG Impact Score
            </h1>
            <p className="text-gray-600 mt-2">Your contribution to Sustainable Development Goals</p>
          </div>

          {/* Analysis Period Selector */}
          <div className="flex items-center gap-3">
            <select
              value={analysisDays}
              onChange={(e) => setAnalysisDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <select
              value={comparisonPeriod}
              onChange={(e) => setComparisonPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={3}>Compare 3 Days</option>
              <option value={7}>Compare 7 Days</option>
              <option value={14}>Compare 14 Days</option>
              <option value={30}>Compare 30 Days</option>
            </select>
          </div>
        </div>

        {/* Main SDG Score Card */}
        <div className={`p-8 border-l-4 ${getScoreBgColor(summary.personalSDGScore)} rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Personal SDG Score</h3>
            <span className="text-4xl">{getRankingIcon(summary.ranking)}</span>
          </div>

          <div className="text-center mb-6">
            <div className={`text-7xl font-black ${getScoreColor(summary.personalSDGScore)}`}>
              {summary.personalSDGScore}
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium uppercase tracking-wide">
              {summary.ranking}
            </div>
            {summary.scoreChange !== 0 && (
              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${
                summary.scoreChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {summary.scoreChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">{summary.scoreChange > 0 ? '+' : ''}{summary.scoreChange} from last period</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SDG 2: Zero Hunger */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">SDG 2: Zero Hunger</h4>
                  <p className="text-sm text-gray-600">Nutrition & Food Security</p>
                </div>
              </div>
              <div className={`text-4xl font-bold mb-4 ${getScoreColor(sdgScores.sdg2Score.overall)}`}>
                {sdgScores.sdg2Score.overall}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Food Security</span>
                  <span className="font-semibold">{sdgScores.sdg2Score.foodSecurity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nutrition Quality</span>
                  <span className="font-semibold">{sdgScores.sdg2Score.nutritionQuality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sustainable Consumption</span>
                  <span className="font-semibold">{sdgScores.sdg2Score.sustainableConsumption}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dietary Diversity</span>
                  <span className="font-semibold">{sdgScores.sdg2Score.dietaryDiversity}</span>
                </div>
              </div>
            </div>

            {/* SDG 12: Responsible Consumption */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">SDG 12: Responsible Consumption</h4>
                  <p className="text-sm text-gray-600">Waste Reduction & Sustainability</p>
                </div>
              </div>
              <div className={`text-4xl font-bold mb-4 ${getScoreColor(sdgScores.sdg12Score.overall)}`}>
                {sdgScores.sdg12Score.overall}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Waste Reduction</span>
                  <span className="font-semibold">{sdgScores.sdg12Score.wasteReduction}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sustainable Consumption</span>
                  <span className="font-semibold">{sdgScores.sdg12Score.sustainableConsumption}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Awareness</span>
                  <span className="font-semibold">{sdgScores.sdg12Score.awareness}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'actions', label: 'Action Steps', icon: Zap },
              { id: 'environmental', label: 'Environmental Impact', icon: Leaf },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-linear-to-r from-green-500 to-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Environmental Impact Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Environmental Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">CO₂ Reduction</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700">{impactMetrics.co2Reduction}</div>
                  <div className="text-xs text-green-600 mt-1">kg saved</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Water Saved</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">{impactMetrics.waterSaved}</div>
                  <div className="text-xs text-blue-600 mt-1">liters saved</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Hunger Impact</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">{impactMetrics.hungerContribution}</div>
                  <div className="text-xs text-orange-600 mt-1">contribution score</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Recycle className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Waste Prevented</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">{impactMetrics.wastePrevented}</div>
                  <div className="text-xs text-purple-600 mt-1">items saved</div>
                </div>
              </div>
            </div>

            {/* Weekly Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Weekly Progress
              </h3>
              <div className="space-y-4">
                {weeklyInsights.map((week) => (
                  <div key={week.week} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-gray-900">{week.week}</div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(week.personalSDGScore)}`}>
                            {week.personalSDGScore}
                          </span>
                          <div className="text-sm text-gray-600">
                            <div>SDG 2: {week.sdg2Score}</div>
                            <div>SDG 12: {week.sdg12Score}</div>
                          </div>
                        </div>
                      </div>
                      {expandedWeek === week.week ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedWeek === week.week && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Highlights
                            </h4>
                            <ul className="space-y-1">
                              {week.highlights.map((highlight, idx) => (
                                <li key={idx} className="text-sm text-gray-700">• {highlight}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Improvements
                            </h4>
                            <ul className="space-y-1">
                              {week.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-gray-700">• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Actionable Steps Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Top Action Steps
              </h3>
              <div className="space-y-3">
                {actionableSteps.slice(0, 3).map((step, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${getTimeframeColor(step.timeframe)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(step.priority)}`}>
                            {step.priority.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {step.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.timeframe}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{step.description}</p>
                        <p className="text-xs text-gray-600 mt-1">{step.sdgTarget}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">+{step.impact}</div>
                        <div className="text-xs text-gray-600">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('actions')}
                className="w-full mt-4 px-4 py-2 bg-linear-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                View All Action Steps
              </button>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {loadingTrends ? (
              <LoadingSpinner message="Loading trend data..." />
            ) : trendsData?.data ? (
              <>
                {/* Trends Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Trend Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* SDG 2 Trends */}
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <h4 className="font-bold text-orange-900 mb-4">SDG 2: Zero Hunger Trends</h4>
                      <div className="space-y-3">
                        {Object.entries(trendsData.data.trends.sdg2Trends).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(value)}
                              <span className="text-sm font-semibold capitalize">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SDG 12 Trends */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-bold text-green-900 mb-4">SDG 12: Responsible Consumption Trends</h4>
                      <div className="space-y-3">
                        {Object.entries(trendsData.data.trends.sdg12Trends).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(value)}
                              <span className="text-sm font-semibold capitalize">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Trends Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6">Weekly Score Progression</h3>
                  <div className="space-y-4">
                    {trendsData.data.weeklyInsights.map((week) => (
                      <div key={week.week} className="flex items-center gap-4">
                        <div className="w-20 font-semibold text-sm">{week.week}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-linear-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${week.personalSDGScore}%` }}
                              >
                                <span className="text-white text-sm font-bold">{week.personalSDGScore}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>SDG 2: {week.sdg2Score}</span>
                            <span>SDG 12: {week.sdg12Score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No trend data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Actionable Steps to Improve Your Score
              </h3>
              <div className="space-y-4">
                {actionableSteps.map((step, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(expandedStep === `${idx}` ? null : `${idx}`)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`px-3 py-1 text-xs font-bold rounded border ${getPriorityColor(step.priority)}`}>
                          {step.priority.toUpperCase()}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900">{step.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600">{step.category.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.timeframe}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">+{step.impact}</div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                      </div>
                      {expandedStep === `${idx}` ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 ml-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
                      )}
                    </button>
                    {expandedStep === `${idx}` && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold">SDG Target:</span>
                            <span className="text-sm text-gray-700">{step.sdgTarget}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold">Timeframe:</span>
                            <span className="text-sm text-gray-700 capitalize">{step.timeframe}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-semibold">Potential Impact:</span>
                            <span className="text-sm text-gray-700">+{step.impact} points to your SDG score</span>
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

        {activeTab === 'environmental' && (
          <div className="space-y-6">
            {loadingEnvironmental ? (
              <LoadingSpinner message="Loading environmental impact..." />
            ) : environmentalData?.data ? (
              <>
                {/* Environmental Metrics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Your Environmental Impact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <Leaf className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {environmentalData.data.impactMetrics.co2Reduction}
                      </div>
                      <div className="text-sm font-medium text-green-900 mb-1">kg CO₂ Reduced</div>
                      <div className="text-xs text-green-600">
                        ≈ {environmentalData.data.comparisons.co2EquivalentCars.toFixed(3)} car emissions
                      </div>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {environmentalData.data.impactMetrics.waterSaved}
                      </div>
                      <div className="text-sm font-medium text-blue-900 mb-1">Liters Water Saved</div>
                      <div className="text-xs text-blue-600">
                        ≈ {environmentalData.data.comparisons.waterShowers} showers
                      </div>
                    </div>

                    <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                      <Heart className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-orange-700 mb-2">
                        {environmentalData.data.impactMetrics.hungerContribution}
                      </div>
                      <div className="text-sm font-medium text-orange-900 mb-1">Hunger Impact</div>
                      <div className="text-xs text-orange-600">
                        ≈ {environmentalData.data.comparisons.mealsProvided} meals provided
                      </div>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <Recycle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-purple-700 mb-2">
                        {environmentalData.data.impactMetrics.wastePrevented}
                      </div>
                      <div className="text-sm font-medium text-purple-900 mb-1">Items Saved</div>
                      <div className="text-xs text-purple-600">from food waste</div>
                    </div>
                  </div>
                </div>

                {/* Environmental Trends */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold mb-6">Environmental Trends</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Waste Reduction</span>
                        {getTrendIcon(environmentalData.data.trends.wasteReductionTrend)}
                      </div>
                      <div className="text-lg font-bold text-green-700 capitalize">
                        {environmentalData.data.trends.wasteReductionTrend}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Sustainable Consumption</span>
                        {getTrendIcon(environmentalData.data.trends.sustainableConsumptionTrend)}
                      </div>
                      <div className="text-lg font-bold text-blue-700 capitalize">
                        {environmentalData.data.trends.sustainableConsumptionTrend}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">Awareness</span>
                        {getTrendIcon(environmentalData.data.trends.awarenessTrend)}
                      </div>
                      <div className="text-lg font-bold text-purple-700 capitalize">
                        {environmentalData.data.trends.awarenessTrend}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental Achievements */}
                {environmentalData.data.achievements.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      Environmental Achievements
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {environmentalData.data.achievements.map((achievement, idx) => (
                        <div key={idx} className="px-4 py-2 bg-linear-to-r from-green-100 to-blue-100 border border-green-200 rounded-full">
                          <span className="font-medium text-green-900">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No environmental impact data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Your Badges
              </h3>
              {achievements.badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {achievements.badges.map((badge, idx) => (
                    <div key={idx} className="text-center p-6 bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                      <div className="font-bold text-gray-900">{badge}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No badges earned yet. Keep working on your SDG goals!</p>
              )}
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Milestones Reached
              </h3>
              {achievements.milestones.length > 0 ? (
                <div className="space-y-3">
                  {achievements.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                      <span className="font-medium text-gray-900">{milestone}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No milestones reached yet. Start logging to track your progress!</p>
              )}
            </div>

            {/* Streaks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Your Streaks
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                  <div className="text-5xl font-black text-green-600 mb-2">
                    {achievements.streaks.wasteReduction}
                  </div>
                  <div className="font-semibold text-green-900">Days</div>
                  <div className="text-sm text-green-700 mt-1">Waste Reduction</div>
                </div>

                <div className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    {achievements.streaks.nutritionImprovement}
                  </div>
                  <div className="font-semibold text-blue-900">Days</div>
                  <div className="text-sm text-blue-700 mt-1">Nutrition Improvement</div>
                </div>

                <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center">
                  <div className="text-5xl font-black text-purple-600 mb-2">
                    {achievements.streaks.sustainableLiving}
                  </div>
                  <div className="font-semibold text-purple-900">Days</div>
                  <div className="text-sm text-purple-700 mt-1">Sustainable Living</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sdgimpactpage;