'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useUserInfo } from '@/lib/context/UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddInventoryModal from './AddInventoryModal';
import InventoryTable from './InventoryTable';
import SuggestedTipsTable from './SuggestedTipsTable';
import SuggestionsAside from './SuggestionsAside';
import InventoryModals from './InventoryModals';

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    expirationDate: string | null;
    hasExpiration: boolean;
    costPerUnit: number;
    createdAt: string;
    updatedAt: string;
}

interface SuggestedTip {
    id: string;
    title: string;
    description: string;
    category: string;
    type: 'article' | 'video' | 'guide' | 'tip';
    url?: string;
    createdAt: string;
}

interface DeleteConfirmModal {
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
}

interface EditModal {
    isOpen: boolean;
    item: InventoryItem | null;
}

interface FilterOptions {
    category: string;
    search: string;
    minCost: string;
    maxCost: string;
    expiringOnly: boolean;
    sortBy: 'createdAt' | 'itemName' | 'category' | 'costPerUnit' | 'expirationDate';
    sortOrder: 'asc' | 'desc';
}

const InventoryPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState<EditModal>({
        isOpen: false,
        item: null,
    });
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmModal>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        category: '',
        search: '',
        minCost: '',
        maxCost: '',
        expiringOnly: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const { user } = useUserInfo();
    const queryClient = useQueryClient();
    const categories = ['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'];

    // Fetch inventory items
    const { data: inventoryData, isLoading, error } = useQuery({
        queryKey: ['inventory', filters],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.minCost) params.append('min_cost', filters.minCost);
            if (filters.maxCost) params.append('max_cost', filters.maxCost);
            if (filters.expiringOnly) params.append('expiring_soon', 'true');
            params.append('sort_by', filters.sortBy);
            params.append('sort_order', filters.sortOrder);

            const queryString = params.toString();
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/inventory${queryString ? '?' + queryString : ''}`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data as InventoryItem[];
        },
        enabled: !!user,
    });

    // Get unique categories from inventory
    const uniqueCategories = React.useMemo(() => {
        if (!inventoryData) return [];
        return [...new Set(inventoryData.map(item => item.category))];
    }, [inventoryData]);

    // Fetch suggested tips based on inventory categories
    const { data: suggestedTips } = useQuery({
        queryKey: ['suggestedTips', uniqueCategories],
        queryFn: async () => {
            if (uniqueCategories.length === 0) return [];
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const tipsPromises = uniqueCategories.map(category =>
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/resources?category=${category}&limit=5`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            );

            const responses = await Promise.all(tipsPromises);
            const allTips = responses.flatMap(res => res.data.data || []);
            return Array.from(new Map(allTips.map(tip => [tip.id, tip])).values()).slice(0, 10) as SuggestedTip[];
        },
        enabled: !!user && uniqueCategories.length > 0,
    });

    // Add item mutation
    const addItemMutation = useMutation({
        mutationFn: async (newItem: {
            itemName: string;
            category: string;
            expirationDate: string | null;
            hasExpiration: boolean;
            costPerUnit: number;
        }) => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/inventory`,
                newItem,
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
            setIsModalOpen(false);
            toast.success('Item added successfully! ✨');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to add item';
            toast.error(message);
        },
    });

    // Delete item mutation
    const deleteItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item deleted successfully! 🗑️');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to delete item';
            toast.error(message);
        },
    });

    // Update item mutation
    const updateItemMutation = useMutation({
        mutationFn: async (data: {
            itemId: string;
            itemName: string;
            category: string;
            expirationDate: string | null;
            hasExpiration: boolean;
            costPerUnit: number;
        }) => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${data.itemId}`,
                {
                    itemName: data.itemName,
                    category: data.category,
                    expirationDate: data.expirationDate,
                    hasExpiration: data.hasExpiration,
                    costPerUnit: data.costPerUnit,
                },
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
            setEditModal({ isOpen: false, item: null });
            toast.success('Item updated successfully! ✏️');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update item';
            toast.error(message);
        },
    });

    return (
        <div className="w-full h-full p-8">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Inventory</h1>
                        <p className="text-gray-600 mt-2">Manage your food items and track expiration</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Item
                    </button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2">
                {/* Search and Filter Bar */}
                <div className="mb-6 space-y-4">
                    {/* Search Input */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by item name..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                showFilters
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <ArrowUpDown className="w-5 h-5 inline mr-2" />
                            Filters
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} className="capitalize">
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Min Cost */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Cost ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.minCost}
                                        onChange={(e) => setFilters({ ...filters, minCost: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                {/* Max Cost */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Cost ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.maxCost}
                                        onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
                                        placeholder="999.99"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'createdAt' | 'itemName' | 'category' | 'costPerUnit' | 'expirationDate' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="createdAt">Date Added</option>
                                        <option value="itemName">Item Name</option>
                                        <option value="category">Category</option>
                                        <option value="costPerUnit">Price</option>
                                        <option value="expirationDate">Expiration Date</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Sort Order */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Order:</label>
                                    <button
                                        onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                            filters.sortOrder === 'asc' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                                    </button>
                                </div>

                                {/* Expiring Soon Filter */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.expiringOnly}
                                        onChange={(e) => setFilters({ ...filters, expiringOnly: e.target.checked })}
                                        className="w-4 h-4 rounded accent-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">🔔 Expiring Soon (≤3 days)</span>
                                </label>

                                {/* Reset Filters Button */}
                                {(filters.search || filters.category || filters.minCost || filters.maxCost || filters.expiringOnly) && (
                                    <button
                                        onClick={() => setFilters({
                                            category: '',
                                            search: '',
                                            minCost: '',
                                            maxCost: '',
                                            expiringOnly: false,
                                            sortBy: 'createdAt',
                                            sortOrder: 'desc',
                                        })}
                                        className="ml-auto px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-all"
                                    >
                                        ✕ Reset Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <AddInventoryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={(data) => addItemMutation.mutate(data)}
                        isLoading={addItemMutation.isPending}
                        categories={categories}
                    />
                )}

                {/* Loading State */}
                {isLoading && <LoadingSpinner message="Loading Inventory..." />}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        <p className="font-semibold">Error loading inventory</p>
                        <p className="text-sm">{error instanceof Error ? error.message : 'Something went wrong'}</p>
                    </div>
                )}

                {/* Inventory Items */}
                {!isLoading && !error && (
                    <>
                        {inventoryData && inventoryData.length > 0 ? (
                            <InventoryTable
                                items={inventoryData}
                                onEdit={(item) => setEditModal({ isOpen: true, item })}
                                onDelete={(itemId, itemName) =>
                                    setDeleteConfirm({ isOpen: true, itemId, itemName })
                                }
                                updateMutationPending={updateItemMutation.isPending}
                                deleteMutationPending={deleteItemMutation.isPending}
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-gray-600 text-lg mb-4">No items in your inventory yet</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add First Item
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Suggested Tips Section */}
                {suggestedTips && suggestedTips.length > 0 && (
                    <SuggestedTipsTable tips={suggestedTips} />
                )}
                    </div>

                    {/* Sidebar - Suggestions */}
                    <div className="lg:col-span-1">
                        {suggestedTips && <SuggestionsAside tips={suggestedTips} />}
                    </div>
                </div>

                {/* Modals */}
                <InventoryModals
                    editModal={editModal}
                    onEditClose={() => setEditModal({ isOpen: false, item: null })}
                    onEditSubmit={(data) => updateItemMutation.mutate(data)}
                    editLoading={updateItemMutation.isPending}
                    deleteConfirm={deleteConfirm}
                    onDeleteClose={() =>
                        setDeleteConfirm({ isOpen: false, itemId: null, itemName: '' })
                    }
                    onDeleteConfirm={(itemId) => {
                        deleteItemMutation.mutate(itemId);
                        setDeleteConfirm({ isOpen: false, itemId: null, itemName: '' });
                    }}
                    deleteLoading={deleteItemMutation.isPending}
                    categories={categories}
                />
            </div>
        </div>
    );
};

export default InventoryPage;
