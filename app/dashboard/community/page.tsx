'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, MapPin, FileText, Loader, Users, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Community {
  _id: string;
  name: string;
  location: string;
  description: string;
  admin: string;
  membersCount: number;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface CreateCommunityInput {
  name: string;
  location: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Functions
const createCommunityAPI = async (data: CreateCommunityInput): Promise<Community> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<Community>>(
    `${API_BASE}/api/communities`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const getAllCommunitiesAPI = async (): Promise<Community[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get<ApiResponse<Community[]>>(
    `${API_BASE}/api/communities`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const joinCommunityAPI = async (communityId: string): Promise<Community> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<Community>>(
    `${API_BASE}/api/communities/${communityId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const CommunityPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCommunityInput>({
    name: '',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCommunityInput, string>>>({});

  // Fetch all communities
  const { data: communities, isLoading, error } = useQuery({
    queryKey: ['communities'],
    queryFn: getAllCommunitiesAPI,
    staleTime: 5 * 60 * 1000,
  });

  // Create community mutation
  const createMutation = useMutation({
    mutationFn: createCommunityAPI,
    onSuccess: (newCommunity) => {
      queryClient.setQueryData(['communities'], (old: Community[] | undefined) => {
        return old ? [newCommunity, ...old] : [newCommunity];
      });

      toast.success(
        () => (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-bold text-gray-900">Community Created! 🎉</p>
              <p className="text-sm text-gray-600">{newCommunity.name} is now live</p>
            </div>
          </div>
        ),
        {
          duration: 4000,
          style: {
            background: '#dcfce7',
            color: '#000',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '2px solid #22c55e',
            padding: '16px',
          },
        }
      );

      setFormData({ name: '', location: '', description: '' });
      setErrors({});
      setShowCreateForm(false);
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to create community';
      toast.error(
        () => (
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-bold text-gray-900">Error</p>
              <p className="text-sm text-gray-600">{errorMessage}</p>
            </div>
          </div>
        ),
        {
          duration: 4000,
          style: {
            background: '#fee2e2',
            color: '#000',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '2px solid #ef4444',
            padding: '16px',
          },
        }
      );
    },
  });

  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: joinCommunityAPI,
    onSuccess: (updatedCommunity) => {
      queryClient.setQueryData(['communities'], (old: Community[] | undefined) => {
        return old?.map((c) => (c._id === updatedCommunity._id ? updatedCommunity : c));
      });

      toast.success(
        () => (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-bold text-gray-900">Joined! ✨</p>
              <p className="text-sm text-gray-600">Welcome to {updatedCommunity.name}</p>
            </div>
          </div>
        ),
        {
          duration: 3000,
          style: {
            background: '#dcfce7',
            color: '#000',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '2px solid #22c55e',
            padding: '16px',
          },
        }
      );
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to join community';
      toast.error(errorMessage, {
        duration: 3000,
        style: {
          background: '#fee2e2',
          color: '#000',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '2px solid #ef4444',
          padding: '16px',
        },
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCommunityInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Community name must be less than 100 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CreateCommunityInput
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Error Loading Communities</h3>
          </div>
          <p className="text-red-700">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">Connect, share, and grow together with NutriMate communities</p>
        </div>

        {/* Create Community Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Plus size={20} />
            Create New Community
          </button>
        </div>

        {/* Create Community Form */}
        {showCreateForm && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Community</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  placeholder="e.g., Keto Diet Enthusiasts"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-orange-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                  maxLength={100}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange(e, 'location')}
                  placeholder="e.g., New York, USA"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                    errors.location
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-orange-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                  maxLength={200}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.location.length}/200 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, 'description')}
                  placeholder="Tell us about this community. What is it about? What are the goals? Who should join?"
                  rows={5}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 font-medium ${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-orange-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                  maxLength={1000}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t border-orange-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', location: '', description: '' });
                    setErrors({});
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Community
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities && communities.length > 0 ? (
            communities.map((community) => {
              // Use isMember property from API response
              const isMember = community.isMember || false;
              
              return (
                <div
                  key={community._id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {community.location}
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">{community.description}</p>
                  </div>

                  <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Members</p>
                      <p className="text-lg font-bold text-orange-600">{community.membersCount}</p>
                    </div>
                  </div>

                  {isMember ? (
                    <button
                      onClick={() => router.push(`/dashboard/community/${community._id}`)}
                      className="w-full py-2 px-4 bg-linear-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Enter Community
                    </button>
                  ) : (
                    <button
                      onClick={() => joinMutation.mutate(community._id)}
                      disabled={joinMutation.isPending}
                      className="w-full py-2 px-4 bg-linear-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {joinMutation.isPending ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Join Community
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No communities yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;