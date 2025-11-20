'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Edit2, Save, X, User, Mail, Ruler, Weight, Calendar, Globe, MapPin, CheckCircle, AlertCircle, Upload, DollarSign, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetPreferences {
  monthlyBudget?: number;
  spendingCategories?: {
    groceries?: number;
    diningOut?: number;
    supplements?: number;
    other?: number;
  };
}

interface DietaryNeeds {
  dietType?: 'balanced' | 'plantBased' | 'lowCarb' | 'highProtein';
  allergies?: string[];
  caloriesPerDay?: number;
  macroTargets?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  waterIntakeGoal?: number;
  avoidIngredients?: string[];
}

interface UserProfile {
  id: string;
  username: string;
  fullname?: string;
  email: string;
  height?: number;
  weight?: number;
  householdSize?: number;
  address?: {
    country?: string;
    city?: string;
  };
  profilePic?: string;
  dateOfBirth?: string;
  budgetPreferences?: BudgetPreferences;
  dietaryNeeds?: DietaryNeeds;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  fullname?: string;
  height?: number;
  weight?: number;
  householdSize?: number;
  address?: {
    country?: string;
    city?: string;
  };
  profilePic?: string;
  dateOfBirth?: string;
  budgetPreferences?: BudgetPreferences;
  dietaryNeeds?: DietaryNeeds;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch user profile
const fetchUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get(`${API_BASE}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

// Update user profile
const updateUserProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.put(`${API_BASE}/api/users/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [isUploadingimg, setIsUploadingimg] = useState(false);
  const [editStep, setEditStep] = useState<1 | 2 | 3>(1);
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      setIsEditing(false);
      setFormData({});
    },
  });

  // Initialize form data when edit mode is toggled
  useEffect(() => {
    if (isEditing && profile) {
      const timer = setTimeout(() => {
        const newFormData: UpdateProfileData = {
          fullname: profile.fullname,
          height: profile.height,
          weight: profile.weight,
          householdSize: profile.householdSize,
          address: profile.address,
          profilePic: profile.profilePic,
          dateOfBirth: profile.dateOfBirth,
          budgetPreferences: profile.budgetPreferences,
          dietaryNeeds: profile.dietaryNeeds,
        };
        setFormData(newFormData);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    if (name.startsWith('address.')) {
      const addressField = name.replace('address.', '');
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value || undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend (exclude profilePic as it's handled separately via upload endpoint)
    const submitData: UpdateProfileData = {
      fullname: formData.fullname || undefined,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      householdSize: formData.householdSize ? Number(formData.householdSize) : undefined,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : undefined,
      budgetPreferences: formData.budgetPreferences,
      dietaryNeeds: formData.dietaryNeeds,
    };
    
    updateMutation.mutate(submitData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditStep(1);
    setFormData({});
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Upload to backend
    setIsUploadingimg(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token');

      const formDataForUpload = new FormData();
      formDataForUpload.append('image', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/profile-picture`,
        formDataForUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update form data with the new profile picture URL
      setFormData((prev) => ({
        ...prev,
        profilePic: response.data.data.profilePic,
      }));

      alert('img uploaded successfully!');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Failed to upload img. Please try again.');
    } finally {
      setIsUploadingimg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Error Loading Profile</h3>
          </div>
          <p className="text-red-700">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-4 px-4 sm:px-6 lg:px-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-200/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-orange-100/20 to-amber-100/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="mb-8">
          <div className="flex items-center justify-end">
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="group relative inline-flex items-center gap-2 px-3 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-orange-100/40 via-transparent to-amber-100/40 pointer-events-none"></div>
              <div className="relative p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  {/* Avatar */}
                  <div className="group shrink-0">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 bg-linear-to-br from-orange-400 via-amber-400 to-orange-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative w-full h-full rounded-full bg-linear-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white text-4xl font-black overflow-hidden border-4 border-white/80 shadow-xl">
                        {profile?.profilePic ? (
                          <img
                            src={profile.profilePic}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          profile?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                      <h2 className="text-4xl font-black text-gray-900 mb-2">{profile?.fullname || profile?.username}</h2>
                    </div>
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-orange-600 font-semibold">
                        <Mail size={18} />
                        <span className="text-gray-700">{profile?.email}</span>
                      </div>
                      <div className="inline-flex sm:inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-linear-to-r from-orange-100 to-amber-100 rounded-full w-fit text-sm font-bold text-orange-700 capitalize">
                        {profile?.role}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Member since {new Date(profile?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-4 text-center">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Height</p>
                <p className="text-2xl font-black text-orange-600">{profile?.height || '—'}</p>
                <p className="text-gray-500 text-xs mt-1">cm</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-4 text-center">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Weight</p>
                <p className="text-2xl font-black text-orange-600">{profile?.weight || '—'}</p>
                <p className="text-gray-500 text-xs mt-1">kg</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-4 text-center">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Household Size</p>
                <p className="text-2xl font-black text-orange-600">{profile?.householdSize || '—'}</p>
                <p className="text-gray-500 text-xs mt-1">people</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-4 text-center">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Country</p>
                <p className="text-lg font-bold text-orange-600">{profile?.address?.country || '—'}</p>
              </div>
            </div>

            {/* Two Column Layout for Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal & Physical Info */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-50/20 via-transparent to-amber-50/20 pointer-events-none"></div>
                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User size={20} className="text-orange-600" />
                      Personal Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm">Full Name</span>
                        <span className="text-gray-900 font-bold">
                          {profile?.fullname || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm">Household Size</span>
                        <span className="text-gray-900 font-bold">
                          {profile?.householdSize ? `${profile.householdSize} people` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                        <span className="text-gray-600 font-medium text-sm">Date of Birth</span>
                        <span className="text-gray-900 font-bold">
                          {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Metrics */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-50/20 via-transparent to-amber-50/20 pointer-events-none"></div>
                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Ruler size={20} className="text-orange-600" />
                      Measurements
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50/30 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Height</p>
                        <p className="text-3xl font-black text-orange-600">{profile?.height || '—'} <span className="text-base">cm</span></p>
                      </div>
                      <div className="p-3 bg-orange-50/30 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Weight</p>
                        <p className="text-3xl font-black text-orange-600">{profile?.weight || '—'} <span className="text-base">kg</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Nutrition & Budget Info */}
              <div className="space-y-6">
                {/* Dietary Needs */}
                {profile?.dietaryNeeds && (
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-orange-50/20 via-transparent to-amber-50/20 pointer-events-none"></div>
                    <div className="relative p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Leaf size={20} className="text-orange-600" />
                        Nutrition
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm">Diet Type</span>
                          <span className="text-gray-900 font-bold capitalize">{profile.dietaryNeeds.dietType || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm">Daily Calories</span>
                          <span className="text-gray-900 font-bold">{profile.dietaryNeeds.caloriesPerDay || '—'} kcal</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm">Water Intake</span>
                          <span className="text-gray-900 font-bold">{profile.dietaryNeeds.waterIntakeGoal || 8} gl/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget Preferences */}
                {profile?.budgetPreferences && (
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-orange-50/20 via-transparent to-amber-50/20 pointer-events-none"></div>
                    <div className="relative p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-orange-600" />
                        Budget
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                          <span className="text-gray-600 font-medium text-sm">Monthly Budget</span>
                          <span className="text-gray-900 font-bold">${profile.budgetPreferences.monthlyBudget || '0'}</span>
                        </div>
                        {profile.budgetPreferences.spendingCategories && (
                          <>
                            <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                              <span className="text-gray-600 font-medium text-sm">Groceries</span>
                              <span className="text-gray-900 font-bold">${profile.budgetPreferences.spendingCategories.groceries || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50/30 rounded-lg">
                              <span className="text-gray-600 font-medium text-sm">Dining Out</span>
                              <span className="text-gray-900 font-bold">${profile.budgetPreferences.spendingCategories.diningOut || 0}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Macro Targets & Other Details */}
            {profile?.dietaryNeeds?.macroTargets && (
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-orange-50/20 via-transparent to-amber-50/20 pointer-events-none"></div>
                <div className="relative p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Macro Targets</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-orange-50/30 rounded-lg text-center">
                      <p className="text-gray-600 text-xs font-semibold mb-1">Protein</p>
                      <p className="text-2xl font-black text-orange-600">{profile.dietaryNeeds.macroTargets.protein || 0}%</p>
                    </div>
                    <div className="p-3 bg-orange-50/30 rounded-lg text-center">
                      <p className="text-gray-600 text-xs font-semibold mb-1">Carbs</p>
                      <p className="text-2xl font-black text-orange-600">{profile.dietaryNeeds.macroTargets.carbs || 0}%</p>
                    </div>
                    <div className="p-3 bg-orange-50/30 rounded-lg text-center">
                      <p className="text-gray-600 text-xs font-semibold mb-1">Fats</p>
                      <p className="text-2xl font-black text-orange-600">{profile.dietaryNeeds.macroTargets.fats || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Timeline */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-bold text-gray-700">Account Timeline</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1 uppercase font-semibold">Created</p>
                  <p className="text-gray-900 font-semibold">{new Date(profile?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1 uppercase font-semibold">Last Updated</p>
                  <p className="text-gray-900 font-semibold">{new Date(profile?.updatedAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode - 2 Step Form
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8 sm:p-12 relative">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
              title="Close"
            >
              <X size={24} className="text-gray-600 hover:text-gray-900" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Edit Your Information</h2>
              <div className="flex items-center gap-3 mt-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${editStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`h-1 flex-1 rounded-full ${editStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${editStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className={`h-1 flex-1 rounded-full ${editStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${editStep === 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {editStep === 1 ? 'Basic Information' : editStep === 2 ? 'Budget Preferences' : 'Dietary Needs'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Basic Information */}
              {editStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <User size={16} className="text-orange-600" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Household Size */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <User size={16} className="text-orange-600" />
                        Household Size
                      </label>
                      <input
                        type="number"
                        name="householdSize"
                        min="1"
                        max="20"
                        value={formData.householdSize || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Number of people in household"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Ruler size={16} className="text-orange-600" />
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter height"
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Weight size={16} className="text-orange-600" />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter weight"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Calendar size={16} className="text-orange-600" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 font-medium"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Globe size={16} className="text-orange-600" />
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address?.country || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter country"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <MapPin size={16} className="text-orange-600" />
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter city"
                      />
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <User size={16} className="text-orange-600" />
                      Profile Picture
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="profilePicInput"
                          accept="image/*"
                          onChange={handleProfilePicChange}
                          disabled={isUploadingimg}
                          className="hidden"
                        />
                        <label
                          htmlFor="profilePicInput"
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-orange-300 rounded-xl hover:bg-orange-50/30 cursor-pointer transition-all duration-300 disabled:opacity-50"
                        >
                          <Upload size={18} className="text-orange-600" />
                          <span className="text-orange-600 font-semibold">{isUploadingimg ? 'Uploading...' : 'Upload New Picture'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Budget Preferences */}
              {editStep === 2 && (
                <div className="space-y-6">
                  <div className="pb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <DollarSign size={20} className="text-orange-600" />
                      Budget Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Monthly Budget</label>
                        <input
                          type="number"
                          value={formData.budgetPreferences?.monthlyBudget || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              budgetPreferences: {
                                ...prev.budgetPreferences,
                                monthlyBudget: e.target.value ? parseFloat(e.target.value) : undefined,
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Enter monthly budget"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Groceries</label>
                        <input
                          type="number"
                          value={formData.budgetPreferences?.spendingCategories?.groceries || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              budgetPreferences: {
                                ...prev.budgetPreferences,
                                spendingCategories: {
                                  ...prev.budgetPreferences?.spendingCategories,
                                  groceries: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Groceries budget"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Dining Out</label>
                        <input
                          type="number"
                          value={formData.budgetPreferences?.spendingCategories?.diningOut || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              budgetPreferences: {
                                ...prev.budgetPreferences,
                                spendingCategories: {
                                  ...prev.budgetPreferences?.spendingCategories,
                                  diningOut: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Dining out budget"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Supplements</label>
                        <input
                          type="number"
                          value={formData.budgetPreferences?.spendingCategories?.supplements || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              budgetPreferences: {
                                ...prev.budgetPreferences,
                                spendingCategories: {
                                  ...prev.budgetPreferences?.spendingCategories,
                                  supplements: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Supplements budget"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Other</label>
                        <input
                          type="number"
                          value={formData.budgetPreferences?.spendingCategories?.other || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              budgetPreferences: {
                                ...prev.budgetPreferences,
                                spendingCategories: {
                                  ...prev.budgetPreferences?.spendingCategories,
                                  other: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Other budget"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Dietary Needs */}
              {editStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Leaf size={20} className="text-orange-600" />
                      Dietary Needs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Diet Type</label>
                        <select
                          value={formData.dietaryNeeds?.dietType || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                dietType: e.target.value as 'balanced' | 'plantBased' | 'lowCarb' | 'highProtein',
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 font-medium"
                        >
                          <option value="">Select diet type</option>
                          <option value="balanced">Balanced</option>
                          <option value="plantBased">Plant Based</option>
                          <option value="lowCarb">Low Carb</option>
                          <option value="highProtein">High Protein</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Calories Per Day</label>
                        <input
                          type="number"
                          value={formData.dietaryNeeds?.caloriesPerDay || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                caloriesPerDay: e.target.value ? parseFloat(e.target.value) : undefined,
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., 2000"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Protein (g)</label>
                        <input
                          type="number"
                          value={formData.dietaryNeeds?.macroTargets?.protein || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                macroTargets: {
                                  ...prev.dietaryNeeds?.macroTargets,
                                  protein: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., 150"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Carbs (g)</label>
                        <input
                          type="number"
                          value={formData.dietaryNeeds?.macroTargets?.carbs || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                macroTargets: {
                                  ...prev.dietaryNeeds?.macroTargets,
                                  carbs: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., 250"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Fats (g)</label>
                        <input
                          type="number"
                          value={formData.dietaryNeeds?.macroTargets?.fats || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                macroTargets: {
                                  ...prev.dietaryNeeds?.macroTargets,
                                  fats: e.target.value ? parseFloat(e.target.value) : undefined,
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., 65"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Water Goal (ml)</label>
                        <input
                          type="number"
                          value={formData.dietaryNeeds?.waterIntakeGoal || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                waterIntakeGoal: e.target.value ? parseFloat(e.target.value) : undefined,
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., 2000"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">Allergies</label>
                        <input
                          type="text"
                          value={formData.dietaryNeeds?.allergies?.join(', ') || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                allergies: e.target.value ? e.target.value.split(',').map((a) => a.trim()) : undefined,
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., nuts, dairy, gluten"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">Ingredients to Avoid</label>
                        <input
                          type="text"
                          value={formData.dietaryNeeds?.avoidIngredients?.join(', ') || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              dietaryNeeds: {
                                ...prev.dietaryNeeds,
                                avoidIngredients: e.target.value ? e.target.value.split(',').map((a) => a.trim()) : undefined,
                              },
                            }));
                          }}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="e.g., artificial sweeteners, MSG"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-between pt-8 border-t border-gray-200">
                <div>
                  {(editStep === 2 || editStep === 3) && (
                    <button
                      type="button"
                      onClick={() => setEditStep((prev) => (prev - 1) as 1 | 2 | 3)}
                      className="group inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-all duration-300"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {editStep === 1 && (
                    <button
                      type="button"
                      onClick={() => setEditStep(2)}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {editStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setEditStep(3)}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {editStep === 3 && (
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {updateMutation.error && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">Error Saving Profile</p>
                    <p className="text-red-700 text-sm mt-1">{(updateMutation.error as Error).message}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;