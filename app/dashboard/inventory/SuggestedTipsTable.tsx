'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ExternalLink } from 'lucide-react';

interface SuggestedTip {
    id: string;
    title: string;
    description: string;
    category: string;
    type: 'article' | 'video' | 'guide' | 'tip';
    url?: string;
}

interface SuggestedTipsTableProps {
    tips: SuggestedTip[];
}

const SuggestedTipsTable: React.FC<SuggestedTipsTableProps> = ({ tips }) => {

    return (
        <div className="mt-12">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 Suggested Tips</h2>
                <p className="text-gray-600">Based on items in your inventory</p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-linear-to-r from-orange-500 to-amber-500 text-white">
                                <th className="px-6 py-3 text-left font-semibold">Title</th>
                                <th className="px-6 py-3 text-left font-semibold">Category</th>
                                <th className="px-6 py-3 text-left font-semibold">Type</th>
                                <th className="px-6 py-3 text-left font-semibold">Description</th>
                                <th className="px-6 py-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.map((tip, index) => (
                                <tr
                                    key={`tip-${tip.id}`}
                                    className={`border-b border-gray-200 transition-colors ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-orange-50`}
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">
                                        {tip.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 capitalize">
                                            {tip.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                            tip.type === 'article' ? 'bg-blue-100 text-blue-700' :
                                            tip.type === 'video' ? 'bg-red-100 text-red-700' :
                                            tip.type === 'guide' ? 'bg-purple-100 text-purple-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {tip.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-sm truncate">
                                        {tip.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            <Link
                                                href={`/dashboard/tips/${tip.id}`}
                                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                                                title="See full details"
                                            >
                                                <Eye className="w-4 h-4" />
                                                See Details
                                            </Link>
                                            {tip.url && (
                                                <a
                                                    href={tip.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Visit resource"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuggestedTipsTable;
