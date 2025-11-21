const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface MealOptimizationRequest {
  budget?: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  familySize?: number;
  weeklyBudget?: boolean;
}

export interface BudgetAnalysisRequest {
  budget: number;
  familySize?: number;
  weeklyBudget?: boolean;
}

export interface MealOptimizationResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalBudget: number;
      allocatedBudget: number;
      remainingBudget: number;
      itemsRecommended: number;
      priorityCategories: string[];
    };
    recommendations: Array<{
      item: {
        name: string;
        category: string;
        quantity: number;
        unit: string;
        costPerUnit: number;
        totalCost: number;
        reason: string;
        nutritionalValue: string;
        alternativeOptions: string[];
        inventoryStatus: string;
      };
      budgetImpact: {
        cost: number;
        remainingBudget: number;
        percentageUsed: number;
      };
      urgency: string;
    }>;
    insights: {
      budgetOptimization: string;
      nutritionalFocus: string;
      costSavingTips: string[];
      mealPlanningSuggestions: string[];
    };
    currentInventory: {
      totalItems: number;
      totalValue: number;
      categories: Record<string, number>;
    };
  };
}

export interface BudgetAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    budget: {
      total: number;
      weekly: number;
      allocated: number;
      remaining: number;
    };
    currentInventory: {
      totalItems: number;
      totalValue: number;
      categories: Record<string, number>;
    };
    availableOptions: {
      totalItems: number;
      averageCost: number;
      categories: Record<string, number>;
    };
    recommendations: {
      budgetUtilization: string;
      suggestedAllocation: Record<string, number>;
    };
  };
}

export interface NutritionalRecommendation {
  name: string;
  category: string;
  costPerUnit: number;
  expirationDays: number;
  nutritionalScore: number;
}

export interface NutritionalRecommendationsResponse {
  success: boolean;
  message: string;
  data: {
    recommendations: NutritionalRecommendation[];
    summary: {
      totalItems: number;
      totalCost: number;
      averageCost: number;
      categories: string[];
    };
  };
}

export const getMealOptimization = async (
  request: MealOptimizationRequest
): Promise<MealOptimizationResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/api/meal-optimizer/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Meal optimization API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get meal optimization');
  }
};

export const getBudgetAnalysis = async (
  request: BudgetAnalysisRequest
): Promise<BudgetAnalysisResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/api/meal-optimizer/budget-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Budget analysis API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get budget analysis');
  }
};

export const getNutritionalRecommendations = async (
  categories?: string[],
  budget?: number
): Promise<NutritionalRecommendationsResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (budget) {
      params.append('budget', budget.toString());
    }

    const url = `${API_URL}/api/meal-optimizer/recommendations${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
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
    console.error('Nutritional recommendations API error:', error);
    throw error instanceof Error ? error : new Error('Failed to get nutritional recommendations');
  }
};
