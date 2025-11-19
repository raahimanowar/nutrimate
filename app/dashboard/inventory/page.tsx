'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
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
// @ts-expect-error: allow importing CSS side-effect without type declarations
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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

interface EditModal {
    isOpen: boolean;
    item: InventoryItem | null;
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

    // Update item mutation
    const updateItemMutation = useMutation({
        mutationFn: async (data: {
            itemId: string;
            itemName: string;
            category: string;
            expirationPeriod: number;
            costPerUnit: number;
        }) => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token');

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${data.itemId}`,
                {
                    itemName: data.itemName,
                    category: data.category,
                    expirationPeriod: data.expirationPeriod,
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
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-linear-to-r from-orange-500 to-amber-500 text-white">
                                            <th className="px-6 py-3 text-left font-semibold">Category</th>
                                            <th className="px-6 py-3 text-left font-semibold">Item Name</th>
                                            <th className="px-6 py-3 text-left font-semibold">Expiration Period (days)</th>
                                            <th className="px-6 py-3 text-left font-semibold">Cost Per Unit</th>
                                            <th className="px-6 py-3 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryData.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className={`border-b border-gray-200 hover:bg-orange-50 transition-colors ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {categoryIcons[item.category.toLowerCase()] || categoryIcons["other"]}
                                                        <span className="font-medium text-gray-900 capitalize">{item.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">{item.itemName}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.expirationPeriod} days
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    ${item.costPerUnit.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditModal({
                                                                    isOpen: true,
                                                                    item: item,
                                                                })
                                                            }
                                                            disabled={updateItemMutation.isPending}
                                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Edit item"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteConfirm({
                                                                    isOpen: true,
                                                                    itemId: item._id,
                                                                    itemName: item.itemName,
                                                                })
                                                            }
                                                            disabled={deleteItemMutation.isPending}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete item"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

                {/* Edit Modal */}
                {editModal.isOpen && editModal.item && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    updateItemMutation.mutate({
                                        itemId: editModal.item!._id,
                                        itemName: formData.get('itemName') as string,
                                        category: formData.get('category') as string,
                                        expirationPeriod: parseInt(formData.get('expirationPeriod') as string),
                                        costPerUnit: parseFloat(formData.get('costPerUnit') as string),
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        defaultValue={editModal.item.itemName}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        defaultValue={editModal.item.category}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} className="capitalize">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Period (days)</label>
                                    <input
                                        type="number"
                                        name="expirationPeriod"
                                        defaultValue={editModal.item.expirationPeriod}
                                        min="1"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit</label>
                                    <input
                                        type="number"
                                        name="costPerUnit"
                                        defaultValue={editModal.item.costPerUnit}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditModal({ isOpen: false, item: null })}
                                        disabled={updateItemMutation.isPending}
                                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateItemMutation.isPending}
                                        className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-medium disabled:opacity-50"
                                    >
                                        {updateItemMutation.isPending ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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