const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types based on backend API
export interface NutrientAnalysis {
  nutrientName: string;
  currentIntake: number;
  recommendedIntake: number;
  deficiencyPercentage: number;
  deficiencyLevel: 'none' | 'mild' | 'moderate' | 'severe';
  trend: 'improving' | 'stable' | 'worsening';
  healthImplications: string[];
  foodSources: string[];
}

export interface FoodSuggestion {
  foodName: string;
  category: string;
  servingSize: string;
  nutrientsProvided: Array<{
    nutrientName: string;
    amount: number;
    percentOfDeficiency: number;
  }>;
  availability: 'in_inventory' | 'in_catalog' | 'not_available';
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  preparationTips: string[];
}

export interface MealSuggestion {
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    nutrientContribution: string[];
  }>;
  preparationSteps: string[];
  nutrientsTargeted: string[];
  estimatedCost: number;
  preparationTime: string;
  servings: number;
}

export interface NutrientGapPrediction {
  summary: {
    analysisPeriod: {
      startDate: string;
      endDate: string;
      daysAnalyzed: number;
    };
    overallNutritionScore: number;
    totalDeficiencies: number;
    severeDeficiencies: number;
    dataCompleteness: number;
    userProfile: {
      age?: number;
      gender?: string;
      activityLevel?: string;
    };
  };
  nutrientAnalysis: NutrientAnalysis[];
  foodSuggestions: FoodSuggestion[];
  mealSuggestions: MealSuggestion[];
  insights: {
    keyFindings: string[];
    recommendations: string[];
    priorityActions: string[];
    preventiveMeasures: string[];
  };
}

export interface NutrientDeficienciesResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalDeficiencies: number;
      filteredDeficiencies: number;
      priorityDeficiencies: number;
      overallNutritionScore: number;
      analysisPeriod: {
        startDate: string;
        endDate: string;
        daysAnalyzed: number;
      };
    };
    nutrientAnalysis: NutrientAnalysis[];
    priorityActions: string[];
    insights: {
      keyFindings: string[];
      recommendations: string[];
    };
  };
}

export interface FoodSuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalSuggestions: number;
      filteredSuggestions: number;
      inventoryItems: number;
      catalogItems: number;
      totalEstimatedCost: number;
      analysisPeriod: {
        startDate: string;
        endDate: string;
        daysAnalyzed: number;
      };
    };
    foodSuggestions: FoodSuggestion[];
    suggestionsByCategory: Record<string, FoodSuggestion[]>;
    priorityItems: FoodSuggestion[];
    inventoryAvailable: FoodSuggestion[];
    needPurchase: FoodSuggestion[];
  };
}

export interface MealSuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalMeals: number;
      filteredMeals: number;
      totalEstimatedCost: number;
      analysisPeriod: {
        startDate: string;
        endDate: string;
        daysAnalyzed: number;
      };
      mealTypesAvailable: string[];
    };
    mealSuggestions: MealSuggestion[];
    mealsByType: Record<string, MealSuggestion[]>;
    breakfastOptions: MealSuggestion[];
    lunchOptions: MealSuggestion[];
    dinnerOptions: MealSuggestion[];
    snackOptions: MealSuggestion[];
  };
}

export interface NutritionInsightsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      overallNutritionScore: number;
      totalDeficiencies: number;
      severeDeficiencies: number;
      dataCompleteness: number;
      analysisPeriod: {
        startDate: string;
        endDate: string;
        daysAnalyzed: number;
      };
      userProfile: {
        age?: number;
        gender?: string;
        activityLevel?: string;
      };
    };
    nutrientAnalysis: NutrientAnalysis[];
    priorityNutrients: NutrientAnalysis[];
    insights: {
      immediate: string[];
      shortTerm: string[];
      informational: string[];
      preventive: string[];
    };
    actionPlan: {
      immediateActions: string[];
      weeklyGoals: string[];
      longTermHealth: string[];
    };
    healthImpact: {
      currentRisks: string[];
      preventionTips: string[];
    };
  };
}

// API Functions
export const getNutrientGapPrediction = async (analysisDays: number = 30): Promise<NutrientGapPrediction> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_URL}/api/nutrient-gap/prediction?analysisDays=${analysisDays}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch nutrient gap prediction');
  }

  const result = await response.json();
  return result.data;
};

export const getNutrientDeficiencies = async (
  analysisDays: number = 30,
  severity: 'mild' | 'moderate' | 'severe' = 'moderate'
): Promise<NutrientDeficienciesResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(
    `${API_URL}/api/nutrient-gap/deficiencies?analysisDays=${analysisDays}&severity=${severity}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch nutrient deficiencies');
  }

  return response.json();
};

export const getFoodSuggestions = async (
  analysisDays: number = 30,
  priority: 'low' | 'medium' | 'high' = 'high',
  availability: 'all' | 'inventory' | 'catalog' = 'all'
): Promise<FoodSuggestionsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(
    `${API_URL}/api/nutrient-gap/food-suggestions?analysisDays=${analysisDays}&priority=${priority}&availability=${availability}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch food suggestions');
  }

  return response.json();
};

export const getMealSuggestions = async (
  analysisDays: number = 30,
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<MealSuggestionsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const url = mealType
    ? `${API_URL}/api/nutrient-gap/meal-suggestions?analysisDays=${analysisDays}&mealType=${mealType}`
    : `${API_URL}/api/nutrient-gap/meal-suggestions?analysisDays=${analysisDays}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch meal suggestions');
  }

  return response.json();
};

export const getNutritionInsights = async (analysisDays: number = 30): Promise<NutritionInsightsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`${API_URL}/api/nutrient-gap/nutrition-insights?analysisDays=${analysisDays}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch nutrition insights');
  }

  return response.json();
};
