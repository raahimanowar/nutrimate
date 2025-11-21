const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface WasteEstimationResponse {
  username: string;
  weeklyWasted: number;
  monthlyWasted: number;
  community: {
    weekly_avg: number;
    monthly_avg: number;
  };
}

export const getWasteEstimation = async (username: string): Promise<WasteEstimationResponse> => {
  const response = await fetch(`${API_URL}/api/waste/${username}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch waste estimation');
  }

  return response.json();
};
