'use client';

import React from 'react';

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

// This component is no longer used - suggestions are displayed in SuggestionsAside
const SuggestedTipsTable: React.FC<SuggestedTipsTableProps> = () => {
    return null;
};

export default SuggestedTipsTable;
