const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// SDG Score Interfaces
export interface SDGScoreSummary {
  analysisPeriod: {
    currentPeriod: {
      startDate: string;
      endDate: string;
      days: number;
    };
    comparisonPeriod: {
      startDate: string;
      endDate: string;
      days: number;
    };
  };
  personalSDGScore: number;
  previousPeriodScore: number;
  scoreChange: number;
  ranking: string;
}

export interface SDG2Score {
  overall: number;
  foodSecurity: number;
  nutritionQuality: number;
  sustainableConsumption: number;
  dietaryDiversity: number;
  trends?: {
    foodSecurity: string;
    nutritionQuality: string;
    sustainableConsumption: string;
    dietaryDiversity: string;
  };
}

export interface SDG12Score {
  overall: number;
  wasteReduction: number;
  sustainableConsumption: number;
  awareness: number;
  trends?: {
    wasteReduction: string;
    sustainableConsumption: string;
    awareness: string;
  };
}

export interface WeeklyInsight {
  week: string;
  personalSDGScore: number;
  sdg2Score: number;
  sdg12Score: number;
  highlights: string[];
  improvements: string[];
}

export interface ActionableStep {
  category: string;
  priority: string;
  impact: number;
  description: string;
  sdgTarget: string;
  timeframe: string;
}

export interface ImpactMetrics {
  co2Reduction: number;
  waterSaved: number;
  hungerContribution: number;
  wastePrevented: number;
  sustainabilityScore?: number;
}

export interface Achievements {
  badges: string[];
  milestones: string[];
  streaks: {
    wasteReduction: number;
    nutritionImprovement: number;
    sustainableLiving: number;
  };
}

export interface SDGScoreResponse {
  success: boolean;
  message: string;
  data: {
    summary: SDGScoreSummary;
    sdgScores: {
      sdg2Score: SDG2Score;
      sdg12Score: SDG12Score;
      personalSDGScore: number;
    };
    weeklyInsights: WeeklyInsight[];
    actionableSteps: ActionableStep[];
    impactMetrics: ImpactMetrics;
    achievements: Achievements;
  };
}

export interface SDGTrendsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      personalSDGScore: number;
      scoreChange: number;
      ranking: string;
      analysisPeriod: {
        startDate: string;
        endDate: string;
      };
    };
    sdgScores: {
      sdg2Score: SDG2Score;
      sdg12Score: SDG12Score;
    };
    weeklyInsights: WeeklyInsight[];
    trends: {
      sdg2Trends: {
        foodSecurity: string;
        nutritionQuality: string;
        sustainableConsumption: string;
        dietaryDiversity: string;
      };
      sdg12Trends: {
        wasteReduction: string;
        sustainableConsumption: string;
        awareness: string;
      };
      overallTrend: string;
    };
    achievements: Achievements;
  };
}

export interface EnvironmentalImpactResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      personalSDGScore: number;
      sdg12Score: number;
      wasteReductionScore: number;
      sustainabilityScore: number;
      analysisPeriod: {
        startDate: string;
        endDate: string;
      };
    };
    impactMetrics: ImpactMetrics;
    comparisons: {
      co2EquivalentCars: number;
      waterShowers: number;
      mealsProvided: number;
    };
    trends: {
      wasteReductionTrend: string;
      sustainableConsumptionTrend: string;
      awarenessTrend: string;
    };
    achievements: string[];
  };
}

// API Functions
export const getSDGScore = async (analysisDays: number = 30, comparisonPeriod: number = 7): Promise<SDGScoreResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(
    `${API_URL}/api/sdg-impact/score?analysisDays=${analysisDays}&comparisonPeriod=${comparisonPeriod}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch SDG score: ${response.status}`);
  }

  return response.json();
};

export const getSDGTrends = async (analysisDays: number = 30, comparisonPeriod: number = 7): Promise<SDGTrendsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(
    `${API_URL}/api/sdg-impact/trends?analysisDays=${analysisDays}&comparisonPeriod=${comparisonPeriod}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch SDG trends: ${response.status}`);
  }

  return response.json();
};

export const getEnvironmentalImpact = async (analysisDays: number = 30, comparisonPeriod: number = 7): Promise<EnvironmentalImpactResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await fetch(
    `${API_URL}/api/sdg-impact/environmental-impact?analysisDays=${analysisDays}&comparisonPeriod=${comparisonPeriod}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch environmental impact: ${response.status}`);
  }

  return response.json();
};
