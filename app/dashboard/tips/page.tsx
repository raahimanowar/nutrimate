'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, AlertCircle, BookOpen, Zap, ChevronLeft, ChevronRight, ChevronDown, Apple, Dumbbell, Wind, Brain } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
  reason?: string;
}

interface ResourcesResponse {
  success: boolean;
  data: Resource[];
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filter: null | Record<string, string>;
}

const TipsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const ITEMS_PER_PAGE = 6;

  // Reset to first page when filters change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  // Fetch resources
  const { data: response, isLoading, error } = useQuery<ResourcesResponse>({
    queryKey: ['resources', selectedCategory, selectedType, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (selectedType) {
        params.append('type', selectedType);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resources?${params.toString()}`;
      const res = await axios.get(url);
      return res.data;
    },
  });

  const resources = response?.data || [];
  const totalPages = response?.totalPages || 0;
  const totalCount = response?.totalCount || 0;

  // Get unique categories
  const categories = Array.from(
    new Set(resources.map((r) => r.category))
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'nutrition':
        return <Apple className="w-8 h-8 text-green-600" />;
      case 'fitness':
        return <Dumbbell className="w-8 h-8 text-red-600" />;
      case 'wellness':
        return <Wind className="w-8 h-8 text-blue-600" />;
      case 'mental health':
        return <Brain className="w-8 h-8 text-purple-600" />;
      default:
        return <BookOpen className="w-8 h-8 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'guide':
        return 'bg-purple-100 text-purple-700';
      case 'tip':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-200/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-orange-100/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header with Dropdowns */}
        <div className="mb-12 flex items-start justify-between gap-6">
          {/* Title Section */}
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900">Tips & Resources</h1>
            </div>
            <p className="text-gray-600 text-lg font-medium">Discover helpful tips, guides, and resources for your nutrition journey</p>
          </div>

          {/* Filter Dropdowns - Top Right */}
          <div className="flex gap-3 flex-wrap justify-end">
            {/* Category Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300"
              >
                <Zap size={16} />
                {selectedCategory || 'Category'}
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10">
                  <button
                    onClick={() => {
                      handleCategoryChange(null);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-bold transition-all ${
                      selectedCategory === null
                        ? 'bg-orange-100 text-orange-600'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleCategoryChange(category);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left font-bold transition-all capitalize ${
                        selectedCategory === category
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300"
              >
                <BookOpen size={16} />
                {selectedType || 'Type'}
                <ChevronDown size={16} className={`transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTypeOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10">
                  <button
                    onClick={() => {
                      handleTypeChange(null);
                      setIsTypeOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-bold transition-all ${
                      selectedType === null
                        ? 'bg-orange-100 text-orange-600'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    All Types
                  </button>
                  {['article', 'video', 'guide', 'tip'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleTypeChange(type);
                        setIsTypeOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left font-bold capitalize transition-all ${
                        selectedType === type
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner message="Loading Resources..." />}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error Loading Resources</h3>
              <p className="text-red-700 text-sm mt-1">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && !error && (
          <>
            {resources.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-orange-100 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Resources Found</h3>
                <p className="text-gray-600">Try selecting a different category or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg hover:shadow-xl hover:shadow-orange-200/30 overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-linear-to-br from-orange-50/30 via-transparent to-amber-50/30 pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative p-6 sm:p-8 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10">
                            {getCategoryIcon(resource.category)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getTypeColor(resource.type)}`}>
                            {resource.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {resource.title}
                        </h3>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm font-semibold text-orange-600 capitalize">{resource.category}</span>
                      </div>

                      {/* See Details Button */}
                      <Link
                        href={`/dashboard/tips/${resource.id}`}
                        className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 w-full"
                      >
                        See Details
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Counter */}
            {resources.length > 0 && (
              <div className="mt-12 space-y-6">
                <p className="text-center text-gray-600 font-medium">
                  Showing <span className="text-orange-600 font-black">{resources.length}</span> of <span className="text-orange-600 font-black">{totalCount}</span> {selectedCategory ? `${selectedCategory} ` : ''}resource{totalCount !== 1 ? 's' : ''}
                </p>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:border-orange-300 hover:bg-orange-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 font-bold rounded-lg transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-linear-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                              : 'bg-white/80 border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:border-orange-300 hover:bg-orange-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TipsPage;