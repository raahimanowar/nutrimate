'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, Calendar, Tag, Link as LinkIcon } from 'lucide-react';

interface ResourceDetail {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const TipDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Fetch resource details
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });

  const resource = response?.data as ResourceDetail | undefined;

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'nutrition':
        return '🥗';
      case 'fitness':
        return '💪';
      case 'wellness':
        return '🧘';
      case 'mental health':
        return '🧠';
      default:
        return '📚';
    }
  };

  const getTypeColor = (type: string) => {
    switch ((type || '').toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isURLDescription = (text: string): boolean => {
    if (!text) return false;
    return /^https?:\/\//.test(text.trim());
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Remove any leading/trailing whitespace
    url = url.trim();
    
    // Handle youtu.be share links with si parameter (e.g., https://youtu.be/Xx7sxWI9FNI?si=XL7Lgwt5KVLsyiGV)
    let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    
    // Handle youtube.com/watch with v parameter
    match = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    
    // Handle youtube.com/embed
    match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    
    // Handle youtube.com/v/
    match = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    
    // Handle youtube.com/shorts/
    match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    
    // If no match, try to extract 11-character video ID directly
    match = url.match(/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      // Verify it looks like a video ID (not just any 11 chars)
      const potentialId = match[1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(potentialId)) {
        return potentialId;
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-200/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-orange-100/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
              <p className="text-lg text-gray-600 font-medium">Loading tip details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error Loading Tip</h3>
              <p className="text-red-700 text-sm mt-1">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Detail Content */}
        {!isLoading && !error && resource && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-orange-100/40 via-transparent to-amber-100/40 pointer-events-none"></div>
              <div className="relative p-8 sm:p-12">
                {/* Category Icon and Type Badge */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="text-5xl">{getCategoryIcon(resource.category)}</div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black text-gray-900 mb-4">{resource.title}</h1>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold capitalize">{resource.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">{formatDate(resource.createdAt)}</span>
                  </div>
                  {resource.url && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-500">Has external resource</span>
                    </div>
                  )}
                </div>

                {/* Description - Only show if it's NOT a URL */}
                {!isURLDescription(resource.description) && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{resource.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section - Video ONLY if description is a URL */}
            {resource.description && isURLDescription(resource.description) && extractYouTubeVideoId(resource.description) && (
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-orange-50/30 via-transparent to-amber-50/30 pointer-events-none"></div>
                <div className="relative p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎥</span>
                    Watch Video
                  </h2>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(resource.description)}`}
                      title={resource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 break-all">
                    <span className="font-semibold">Video Source:</span> {resource.description}
                  </p>
                </div>
              </div>
            )} 

            

            {/* Related Resources Link */}
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard/tips')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Back to All Tips
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TipDetailPage;
