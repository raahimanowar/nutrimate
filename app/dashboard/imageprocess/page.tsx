'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, Trash2, Download, Tag, Calendar, Image as ImageIcon } from 'lucide-react';

interface FoodImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageType: 'receipt' | 'food_label' | 'meal_photo' | 'ingredient';
  tags: string[];
  associationType: 'inventory' | 'daily_log' | 'none';
  associatedId?: string;
  scanStatus: string;
  createdAt: string;
}

interface GetImagesResponse {
  success: boolean;
  data: {
    images: FoodImage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: FoodImage;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch user's food images
const fetchFoodImages = async (page: number, imageType?: string, associationType?: string): Promise<GetImagesResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', '12');
  params.append('sortBy', 'createdAt');
  params.append('sortOrder', 'desc');
  if (imageType) params.append('imageType', imageType);
  if (associationType) params.append('associationType', associationType);

  const response = await axios.get(`${API_BASE}/api/food-images?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return response.data;
};

// Upload food image
const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post(`${API_BASE}/api/food-images/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return response.data;
};

// Delete food image
const deleteImage = async (imageId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  await axios.delete(`${API_BASE}/api/food-images/${imageId}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
};

const ImageProcessPage = () => {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('');
  const [filterAssociation, setFilterAssociation] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageType: 'receipt',
    tags: '',
  });
  const queryClient = useQueryClient();

  // Fetch images
  const { data: imagesData, isLoading } = useQuery<GetImagesResponse>({
    queryKey: ['foodImages', page, filterType, filterAssociation],
    queryFn: () => fetchFoodImages(page, filterType || undefined, filterAssociation || undefined),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodImages'] });
      toast.success('Image uploaded successfully!');
      setUploading(false);
    },
    onError: (error: Error) => {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
      setUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodImages'] });
      toast.success('Image deleted successfully');
    },
    onError: (error: Error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(message);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      title: file.name.split('.')[0]
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !formData.title.trim()) {
      toast.error('Please select a file and enter a title');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('imageType', formData.imageType);
    if (formData.description.trim()) {
      uploadFormData.append('description', formData.description);
    }
    if (formData.tags.trim()) {
      uploadFormData.append('tags', formData.tags);
    }

    setUploading(true);
    uploadMutation.mutate(uploadFormData);
    
    if (uploadMutation.isSuccess) {
      setSelectedFile(null);
      setFormData({
        title: '',
        description: '',
        imageType: 'receipt',
        tags: '',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
  };

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'receipt': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'food_label': return 'bg-green-100 text-green-700 border-green-200';
      case 'meal_photo': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ingredient': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAssociationColor = (type: string) => {
    switch (type) {
      case 'inventory': return 'bg-amber-100 text-amber-700';
      case 'daily_log': return 'bg-indigo-100 text-indigo-700';
      case 'none': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const images = imagesData?.data?.images || [];
  const pagination = imagesData?.data?.pagination;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-amber-500 mx-auto animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Image Processing</h1>
          <p className="text-gray-600 mt-2">Manage food images, receipts, and labels</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Image</h2>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">Image File *</label>
              <label className="flex items-center justify-center border-3 border-dashed border-orange-200 rounded-xl p-8 hover:border-orange-400 transition cursor-pointer bg-orange-50">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG (max 10MB)</p>
                </div>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter image title"
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
                  required
                />
              </div>

              {/* Image Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Image Type *</label>
                <select
                  value={formData.imageType}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
                >
                  <option value="receipt">Receipt</option>
                  <option value="food_label">Food Label</option>
                  <option value="meal_photo">Meal Photo</option>
                  <option value="ingredient">Ingredient</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter optional description..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Enter tags separated by commas (e.g., grocery, shopping)"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Image Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
              >
                <option value="">All Types</option>
                <option value="receipt">Receipt</option>
                <option value="food_label">Food Label</option>
                <option value="meal_photo">Meal Photo</option>
                <option value="ingredient">Ingredient</option>
              </select>
            </div>

            {/* Filter by Association */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Association</label>
              <select
                value={filterAssociation}
                onChange={(e) => {
                  setFilterAssociation(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
              >
                <option value="">All</option>
                <option value="none">Unassociated</option>
                <option value="inventory">Inventory</option>
                <option value="daily_log">Daily Log</option>
              </select>
            </div>

            {/* Total Count */}
            <div className="flex items-end">
              <div className="bg-linear-to-r from-orange-100 to-amber-100 rounded-lg p-4 w-full border-2 border-orange-200">
                <p className="text-sm text-gray-600 font-medium">Total Images</p>
                <p className="text-2xl font-black text-orange-600">{pagination?.totalItems || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="group bg-white rounded-2xl border-2 border-orange-100 shadow-lg hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden">
                {/* Image Container */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  {/* Using img element as Next Image requires optimization API */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a
                      href={image.imageUrl}
                      download
                      className="p-3 bg-white rounded-full hover:bg-orange-500 hover:text-white transition text-gray-700"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => deleteMutation.mutate(image.id)}
                      className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition text-white"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Type Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border-2 ${getImageTypeColor(image.imageType)}`}>
                    {image.imageType.replace('_', ' ')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{image.title}</h3>

                  {/* Description */}
                  {image.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  )}

                  {/* Tags */}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {image.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Association Badge */}
                  <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-3 ${getAssociationColor(image.associationType)}`}>
                    {image.associationType === 'none' ? 'Unassociated' : image.associationType.replace('_', ' ')}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(image.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-16 border-2 border-dashed border-orange-200 text-center">
            <ImageIcon className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Images Yet</h3>
            <p className="text-gray-600 mb-6">Upload your first food image to get started!</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:shadow-lg transition font-semibold cursor-pointer">
              <Upload className="w-5 h-5" />
              Upload Image
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-6 py-2 bg-white border-2 border-orange-200 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold transition ${
                    p === page
                      ? 'bg-linear-to-r from-orange-500 to-amber-600 text-white'
                      : 'bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={!pagination.hasNextPage}
              className="px-6 py-2 bg-white border-2 border-orange-200 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageProcessPage;