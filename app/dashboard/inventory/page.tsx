'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useUserInfo } from '@/lib/context/UserContext';
import AddInventoryModal from './AddInventoryModal';
import {
    Apple,
    Leaf,
    Milk,
    Wheat,
    Drumstick,
    Coffee,
    Cookie,
    Package
} from "lucide-react";

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    expirationPeriod: number;
    costPerUnit: number;
    createdAt: string;
    updatedAt: string;
}

interface DeleteConfirmModal {
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
}

const InventoryPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmModal>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });
    const router = useRouter();
    const { user } = useUserInfo();
    const queryClient = useQueryClient();

    const categoryIcons: Record<string, React.ReactElement> = {
        fruits: <Apple className="w-6 h-6 text-orange-600" />,
        vegetables: <Leaf className="w-6 h-6 text-green-600" />,
        dairy: <Milk className="w-6 h-6 text-blue-600" />,
        grains: <Wheat className="w-6 h-6 text-amber-600" />,
        protein: <Drumstick className="w-6 h-6 text-red-600" />,
        beverages: <Coffee className="w-6 h-6 text-brown-600" />,
        snacks: <Cookie className="w-6 h-6 text-yellow-600" />,
        other: <Package className="w-6 h-6 text-gray-600" />
    };


    // Fetch inventory items
    const { data: inventoryData, isLoading, error } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data as InventoryItem[];
        },
        enabled: !!user, // Only fetch if user is logged in
    });

    // Add item mutation
    const addItemMutation = useMutation({
        mutationFn: async (newItem: {
            itemName: string;
            category: string;
            expirationPeriod: number;
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
            // Invalidate and refetch inventory
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setIsModalOpen(false);
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
        },
    });

    const categories = ['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'];

    return (
        <div className="w-full h-full p-8 ">
            <div className="max-w-6xl mx-auto">
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
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            <p className="mt-4 text-gray-600">Loading inventory...</p>
                        </div>
                    </div>
                )}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {inventoryData.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
                                    >
                                        {/* Header with Delete Icon */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2 flex-1">
                                                {categoryIcons[item.category.toLowerCase()] || categoryIcons["other"]}
                                                <h3 className="text-lg font-bold text-gray-900 capitalize">{item.category}</h3>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm({
                                                        isOpen: true,
                                                        itemId: item._id,
                                                        itemName: item.itemName,
                                                    })
                                                }
                                                disabled={deleteItemMutation.isPending}
                                                className="ml-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                                                title="Delete item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Quantity Display */}
                                        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                                            <p className="text-2xl font-bold text-orange-600">{item.itemName}</p>
                                        </div>

                                        {/* Details Button */}
                                        <button
                                            onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
                                            className="w-full mt-auto bg-linear-to-r from-orange-500 to-amber-600 text-white py-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
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

                {/* Delete Confirmation Modal */}
                {deleteConfirm.isOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Item?</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-semibold">{deleteConfirm.itemName}</span>? This
                                action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        setDeleteConfirm({
                                            isOpen: false,
                                            itemId: null,
                                            itemName: '',
                                        })
                                    }
                                    disabled={deleteItemMutation.isPending}
                                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirm.itemId) {
                                            deleteItemMutation.mutate(deleteConfirm.itemId);
                                            setDeleteConfirm({
                                                isOpen: false,
                                                itemId: null,
                                                itemName: '',
                                            });
                                        }
                                    }}
                                    disabled={deleteItemMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {deleteItemMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryPage;