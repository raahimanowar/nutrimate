'use client';

import React from 'react';

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    expirationDate: string | null;
    hasExpiration: boolean;
    costPerUnit: number;
}

interface InventoryModalsProps {
    editModal: {
        isOpen: boolean;
        item: InventoryItem | null;
    };
    onEditClose: () => void;
    onEditSubmit: (data: {
        itemId: string;
        itemName: string;
        category: string;
        expirationDate: string | null;
        hasExpiration: boolean;
        costPerUnit: number;
    }) => void;
    editLoading: boolean;

    deleteConfirm: {
        isOpen: boolean;
        itemId: string | null;
        itemName: string;
    };
    onDeleteClose: () => void;
    onDeleteConfirm: (itemId: string) => void;
    deleteLoading: boolean;

    categories: string[];
}

const InventoryModals: React.FC<InventoryModalsProps> = ({
    editModal,
    onEditClose,
    onEditSubmit,
    editLoading,
    deleteConfirm,
    onDeleteClose,
    onDeleteConfirm,
    deleteLoading,
    categories,
}) => {
    return (
        <>
            {/* Edit Modal */}
            {editModal.isOpen && editModal.item && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                onEditSubmit({
                                    itemId: editModal.item!._id,
                                    itemName: formData.get('itemName') as string,
                                    category: formData.get('category') as string,
                                    expirationDate: (formData.get('expirationDate') as string) || null,
                                    hasExpiration: formData.get('hasExpiration') === 'on',
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
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="hasExpiration"
                                        defaultChecked={editModal.item.hasExpiration}
                                        className="w-4 h-4 rounded accent-orange-500"
                                    />
                                    Has Expiration Date
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
                                <input
                                    type="date"
                                    name="expirationDate"
                                    defaultValue={editModal.item.expirationDate ? editModal.item.expirationDate.split('T')[0] : ''}
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
                                    onClick={onEditClose}
                                    disabled={editLoading}
                                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-medium disabled:opacity-50"
                                >
                                    {editLoading ? 'Updating...' : 'Update'}
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
                                onClick={onDeleteClose}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.itemId) {
                                        onDeleteConfirm(deleteConfirm.itemId);
                                    }
                                }}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InventoryModals;
