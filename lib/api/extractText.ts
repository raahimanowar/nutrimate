const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ExtractTextResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
    extractedText: string;
  };
}

export const extractTextFromImage = async (imageFile: File): Promise<ExtractTextResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/api/extractText`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Extract text API error:', error);
    throw error instanceof Error ? error : new Error('Failed to extract text from image');
  }
};
