'use client';

import React, { useState } from 'react';
import { extractTextFromImage } from '@/lib/api/extractText';
import { purifyExtractedText, PurifiedData } from '@/lib/api/purifyText';
import { Upload, FileText, Image as ImageIcon, AlertCircle, X, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ExtractedData {
  [key: string]: string | number | boolean | object;
}

const Imageextractpage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [purifiedData, setPurifiedData] = useState<PurifiedData | null>(null);
  const [isPurifying, setIsPurifying] = useState(false);
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();

  // Category mapping from AI categories to inventory categories
  const mapCategory = (aiCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Beverages': 'beverages',
      'Dairy': 'dairy',
      'Fruits': 'fruits',
      'Vegetables': 'vegetables',
      'Grains': 'grains',
      'Meat': 'protein',
      'Snacks': 'snacks',
      'Condiments': 'other',
      'Frozen': 'other',
      'Bakery': 'other'
    };
    return categoryMap[aiCategory] || 'other';
  };

  // Unit mapping to normalize AI-returned units to valid backend units
  const mapUnit = (aiUnit: string): string => {
    const unit = aiUnit.toLowerCase().trim();
    const unitMap: { [key: string]: string } = {
      // Weight units
      'kilogram': 'kg',
      'kilograms': 'kg',
      'kilo': 'kg',
      'gram': 'g',
      'grams': 'g',
      'pound': 'lb',
      'pounds': 'lb',
      'ounce': 'oz',
      'ounces': 'oz',
      // Volume units
      'liter': 'l',
      'liters': 'l',
      'litre': 'l',
      'litres': 'l',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'millilitre': 'ml',
      'millilitres': 'ml',
      'gallon': 'gal',
      'gallons': 'gal',
      // Count units
      'piece': 'pieces',
      'item': 'items',
      'unit': 'units',
      'serving': 'servings',
      'pcs': 'pieces',
      'pc': 'pieces',
    };
    
    // Return mapped unit or check if it's already valid
    const validUnits = ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'gal', 'qt', 'pt', 'cup', 'fl oz', 
                       'pieces', 'items', 'servings', 'units', 'dozen', 'pair', 'pack', 
                       'box', 'bottle', 'jar', 'can'];
    
    const mapped = unitMap[unit] || unit;
    return validUnits.includes(mapped) ? mapped : 'pieces';
  };

  // Add to inventory mutation
  const addToInventoryMutation = useMutation({
    mutationFn: async (data: PurifiedData) => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token');

      // Parse expiration date to ISO format
      let expirationDate = null;
      if (data.expirationDate && data.expirationDate.trim()) {
        try {
          // Assume format DD/MM/YYYY
          const [day, month, year] = data.expirationDate.split('/');
          if (day && month && year) {
            expirationDate = new Date(`${year}-${month}-${day}`).toISOString();
          }
        } catch (e) {
          console.error('Date parsing error:', e);
        }
      }

      const inventoryItem = {
        itemName: data.itemName,
        category: mapCategory(data.category),
        expirationDate: expirationDate,
        hasExpiration: !!expirationDate,
        costPerUnit: data.price || 0,
        quantity: data.quantity || 1,
        unit: mapUnit(data.unit || 'pieces')
      };

      console.log('Sending to inventory:', inventoryItem);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory`,
        inventoryItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item added to inventory successfully! 🎉');
      // Reset the form after successful addition
      handleReset();
    },
    onError: (error: unknown) => {
      console.error('Add to inventory error:', error);
      let message = 'Failed to add to inventory';
      
      // Extract validation errors from axios response
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          message = error.response.data.errors.map((e: { msg: string }) => e.msg).join(', ');
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error(message);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG and PNG are allowed');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedData(null);
    setPurifiedData(null);

    try {
      const response = await extractTextFromImage(selectedFile);
      
      if (response.success) {
        const rawText = response.data.extractedText;
        setExtractedData({ 'Raw Extracted Text': rawText });
        toast.success('Text extracted successfully!');

        // Automatically purify with AI
        setIsPurifying(true);
        try {
          const purified = await purifyExtractedText(rawText);
          setPurifiedData(purified);
          toast.success('AI purification completed!', { icon: '✨' });
        } catch (purifyError) {
          console.error('Purification error:', purifyError);
          toast.error('AI purification failed, showing raw data');
        } finally {
          setIsPurifying(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setExtractedData(null);
    setPurifiedData(null);
    setError('');
  };

  const renderFormField = (key: string, value: string | number | boolean | object) => {
    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="text"
          value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          readOnly
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
    );
  };

  return (
    <div className="w-full h-full p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-10 h-10 text-slate-700" />
          Text Extraction
        </h1>
        <p className="text-slate-600 mt-2">
          Upload an image to extract and parse text data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-700 font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    PNG or JPEG (max 10MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ImageIcon className="w-4 h-4" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-slate-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Tips for Best Results
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use clear, high-resolution images</li>
              <li>• Ensure text is readable and well-lit</li>
              <li>• Avoid blurry or distorted images</li>
              <li>• Supported formats: JPEG, PNG</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isPurifying && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3 animate-pulse" />
              <p className="text-purple-900 font-medium">AI is purifying the data...</p>
              <p className="text-sm text-purple-700 mt-1">This may take a few seconds</p>
            </div>
          )}

          {purifiedData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Purified Data
                </h2>
                <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
                  purifiedData.confidence === 'HIGH' ? 'bg-green-100 text-green-800' :
                  purifiedData.confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {purifiedData.confidence} CONFIDENCE
                </span>
              </div>

              <div className="space-y-4">
                {renderFormField('Item Name', purifiedData.itemName)}
                {renderFormField('Price (TK)', purifiedData.price)}
                {renderFormField('Quantity', purifiedData.quantity)}
                {renderFormField('Unit', purifiedData.unit)}
                {renderFormField('Expiration Date', purifiedData.expirationDate || 'Not found')}
                {renderFormField('Category', purifiedData.category)}
              </div>

              {/* Add to Inventory Button */}
              <button
                onClick={() => addToInventoryMutation.mutate(purifiedData)}
                disabled={addToInventoryMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold mt-4"
              >
                {addToInventoryMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding to Inventory...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Inventory
                  </>
                )}
              </button>

              {/* Raw Extracted Text */}
              {extractedData && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                    View Raw Extracted Text
                  </summary>
                  <pre className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap">
                    {Object.values(extractedData)[0] as string}
                  </pre>
                </details>
              )}
            </div>
          )}

          {!extractedData && !error && !isPurifying && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Upload and extract an image to see AI-purified results here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Imageextractpage;