'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { X, ArrowRight, AlertCircle } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
}

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string | null;
}

const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose, category }) => {
  const [displayItems, setDisplayItems] = useState<number>(3);

  // Fetch resources for the category
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['resources-modal', category],
    queryFn: async () => {
      if (!category) return null;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources?category=${category}&limit=10`
      );
      return res.data;
    },
    enabled: !!category && isOpen,
  });

  const resources = response?.data || [];

  const getTypeColor = (type: string): string => {
    const typeStr = (type || '').toLowerCase();
    if (typeStr === 'article') return 'bg-blue-100 text-blue-700';
    if (typeStr === 'video') return 'bg-red-100 text-red-700';
    if (typeStr === 'guide') return 'bg-purple-100 text-purple-700';
    if (typeStr === 'tip') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getCategoryIcon = (category: string): string => {
    const catStr = (category || '').toLowerCase();
    if (catStr === 'nutrition') return '🥗';
    if (catStr === 'fitness') return '💪';
    if (catStr === 'wellness') return '🧘';
    if (catStr === 'mental health') return '🧠';
    return '📚';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-amber-600 text-white p-6 sm:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getCategoryIcon(category || '')}</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">Recommended Tips</h2>
              <p className="text-orange-100 text-sm capitalize">{category} Resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse mb-4"></div>
              <p className="text-gray-600 font-medium">Loading tips...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-bold">Error loading tips</p>
                <p className="text-red-700 text-sm">{(error as Error).message}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && resources.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium">No resources found for this category</p>
            </div>
          )}

          {!isLoading && !error && resources.length > 0 && (
            <div className="space-y-4">
              {resources.slice(0, displayItems).map((resource: Resource) => (
                <div
                  key={resource.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 flex-1 line-clamp-2">{resource.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap shrink-0 ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{resource.description || 'No description available'}</p>

                  <Link
                    href={`/dashboard/tips/${resource.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-linear-to-r from-orange-500 to-amber-600 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    See Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}

              {resources.length > displayItems && (
                <button
                  onClick={() => setDisplayItems((prev) => prev + 3)}
                  className="w-full py-3 text-orange-600 font-bold hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Load More Tips
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 sm:p-6 flex justify-end gap-3">
          <Link
            href="/dashboard/tips"
            onClick={onClose}
            className="px-4 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-lg transition-colors"
          >
            View All Tips
          </Link>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesModal;
