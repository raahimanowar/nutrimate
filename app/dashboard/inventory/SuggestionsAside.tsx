'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface SuggestedTip {
    id: string;
    title: string;
    description: string;
    category: string;
    type: 'article' | 'video' | 'guide' | 'tip';
    url?: string;
}

interface SuggestionsAsideProps {
    tips: SuggestedTip[];
}

const SuggestionsAside: React.FC<SuggestionsAsideProps> = ({ tips }) => {
    if (tips.length === 0) {
        return null;
    }

    return (
        <aside className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-20 h-fit">
            {/* Header */}
            <div className="bg-linear-to-r from-orange-500 to-amber-500 text-white p-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Suggestions</h3>
                    <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                        {tips.length}
                    </span>
                </div>
            </div>

            {/* Suggestions List */}
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {tips.map((tip, index) => (
                    <div
                        key={`suggestion-${tip.id}`}
                        className="px-3 py-2.5 hover:bg-orange-50 transition-colors group flex items-center gap-2"
                    >
                        <div className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 group-hover:text-orange-600 transition-colors">
                            {tip.title}
                        </h4>
                        <Link
                            href={`/dashboard/tips/${tip.id}`}
                            className="shrink-0 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors whitespace-nowrap"
                        >
                            See Details
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="bg-linear-to-r from-orange-50 to-amber-50 px-4 py-3 border-t border-orange-200">
                <p className="text-xs text-gray-600">
                    <span className="font-semibold text-orange-600">{tips.length}</span> personalized tips based on your inventory
                </p>
            </div>
        </aside>
    );
};

export default SuggestionsAside;
