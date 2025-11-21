const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ExpirationRiskItem {
  item: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expirationDate: string;
    daysUntilExpiration: number;
    estimatedValue: number;
  };
  riskAnalysis: {
    overallRiskScore: number;
    expirationRisk: 'critical' | 'high' | 'medium' | 'low';
    consumptionUrgency: 'immediate' | 'high' | 'moderate' | 'low';
    seasonalityRisk: 'increased' | 'normal' | 'decreased';
    aiRiskScore: number;
  };
  recommendations: {
    consumeBy: string;
    consumptionPriority: number;
    storageTips: string[];
    alternativeUses: string[];
    alertLevel: 'red' | 'orange' | 'yellow' | 'green';
  };
  reasoning: {
    primaryReason: string;
    contributingFactors: string[];
    seasonalityImpact: string;
    consumptionPatternAnalysis: string;
  };
}

export interface ExpirationRiskResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalItemsAnalyzed: number;
      criticalAlerts: number;
      highRiskItems: number;
      potentialLoss: number;
      userLocation: string;
      currentSeason: string;
      analysisDate: string;
      overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
    };
    riskPredictions: ExpirationRiskItem[];
    consumptionPriority: Array<{
      itemName: string;
      priority: number;
      reason: string;
      alertLevel: string;
    }>;
    insights: {
      seasonalAlerts: string[];
      consumptionTips: string[];
      wastePreventionStrategies: string[];
    };
  };
}

export interface HighRiskItemsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalHighRiskItems: number;
      criticalItems: number;
      totalValueAtRisk: number;
    };
    highRiskItems: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expirationDate: string;
      daysUntilExpiration: number;
      alertLevel: 'red' | 'orange' | 'yellow' | 'green';
      consumeBy: string;
      primaryReason: string;
      storageTips: string[];
      estimatedValue: number;
    }>;
    urgentActions: Array<{
      itemName: string;
      priority: number;
      reason: string;
      alertLevel: string;
    }>;
    seasonalAlerts: string[];
  };
}

export interface SeasonalAlertsResponse {
  success: boolean;
  message: string;
  data: {
    currentSeason: string;
    userLocation: string;
    seasonalAlerts: string[];
    affectedCategories: string[];
    seasonalTips: string[];
    highRiskSeasonalItems: Array<{
      id: string;
      name: string;
      category: string;
      seasonalityImpact: string;
      alertLevel: string;
    }>;
  };
}

export const getExpirationRiskPredictions = async (): Promise<ExpirationRiskResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/api/expiration-risk/predictions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Expiration risk predictions API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get expiration risk predictions');
  }
};

export const getHighRiskItems = async (): Promise<HighRiskItemsResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/api/expiration-risk/high-risk`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('High-risk items API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get high-risk items');
  }
};

export const getSeasonalAlerts = async (): Promise<SeasonalAlertsResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/api/expiration-risk/seasonal-alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Seasonal alerts API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get seasonal alerts');
  }
};
