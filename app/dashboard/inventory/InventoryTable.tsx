'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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
    expirationDate: string | null;
    hasExpiration: boolean;
    costPerUnit: number;
    quantity?: number;
    unit?: string;
    baseQuantity?: number;
    baseUnit?: string;
    createdAt: string;
    updatedAt: string;
}

interface InventoryTableProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (itemId: string, itemName: string) => void;
    updateMutationPending: boolean;
    deleteMutationPending: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
    items,
    onEdit,
    onDelete,
    updateMutationPending,
    deleteMutationPending,
}) => {
    const router = useRouter();

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

    return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full border-collapse min-w-full">
                <thead>
                    <tr className="bg-linear-to-r from-orange-500 to-amber-500 text-white">
                        <th className="px-4 py-3 text-left font-semibold min-w-[120px]">Category</th>
                        <th className="px-4 py-3 text-left font-semibold min-w-[140px]">Item Name</th>
                        <th className="px-4 py-3 text-left font-semibold min-w-[110px]">Quantity</th>
                        <th className="px-4 py-3 text-left font-semibold min-w-[140px]">Expiration Date</th>
                        <th className="px-4 py-3 text-left font-semibold min-w-[110px]">Cost Per Unit</th>
                        <th className="px-4 py-3 text-center font-semibold min-w-[100px]">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const expiryDate = item.expirationDate ? new Date(item.expirationDate) : null;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                        const isExpired = daysLeft !== null && daysLeft < 0;
                        const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

                        return (
                            <tr
                                key={item._id}
                                className={`border-b border-gray-200 transition-colors ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } ${isExpired ? 'bg-red-50' : ''} ${isExpiringSoon && !isExpired ? 'bg-yellow-50' : ''} hover:bg-orange-50`}
                            >
                                <td className="px-4 py-4 whitespace-normal">
                                    <div className="flex items-center gap-2">
                                        {categoryIcons[item.category.toLowerCase()] || categoryIcons["other"]}
                                        <span className="font-medium text-gray-900 capitalize word-break">{item.category}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="font-semibold text-gray-900 break-all">{item.itemName}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{(item.quantity || 1).toFixed(1)}</span>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">{item.unit || 'pieces'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="text-gray-900">
                                            {item.expirationDate
                                                ? new Date(item.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : 'N/A'}
                                        </p>
                                        {daysLeft !== null && (
                                            <p className={`text-sm font-medium ${
                                                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                                {isExpired ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`}
                                            </p>
                                        )}
                                        {!item.hasExpiration && <p className="text-sm text-gray-500">No expiration</p>}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-gray-600">
                                    tk {item.costPerUnit.toFixed(2)}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(item)}
                                            disabled={updateMutationPending}
                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Edit item"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item._id, item.itemName)}
                                            disabled={deleteMutationPending}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
