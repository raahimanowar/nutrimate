import { GoogleGenAI } from '@google/genai';

export interface PurifiedData {
  itemName: string;
  price: number;
  quantity: number;
  unit: string;
  expirationDate: string;
  category: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

const GEMINI_API_KEY = 'AIzaSyAHLckHbURBcz3TcEOPYIf7WStLPbOBkh8';

export const purifyExtractedText = async (extractedText: string): Promise<PurifiedData> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `You are a food inventory data extraction assistant. Analyze the following OCR-extracted text from a food product label and extract structured information.

EXTRACTED TEXT:
${extractedText}

Your task:
1. Identify the food item name (clean up OCR errors)
2. Extract the price in Taka/TK (numeric value only)
3. Extract the quantity (numeric value)
4. Extract the unit (e.g., liter, ml, gram, kg, piece)
5. Extract the expiration/expiry date (format: DD/MM/YYYY)
6. Suggest a food category from: Beverages, Dairy, Fruits, Vegetables, Grains, Meat, Snacks, Condiments, Frozen, Bakery
7. Rate your confidence: HIGH, MEDIUM, or LOW

IMPORTANT RULES:
- Clean up item names (remove special characters, fix spacing)
- If price not found, use 0
- If quantity not found, use 1
- If unit not found, use piece
- If date not found or invalid, use empty string
- Return ONLY valid JSON (no markdown, no explanation)

Return this exact JSON structure:
{
  "itemName": "cleaned product name",
  "price": 0,
  "quantity": 0,
  "unit": "unit",
  "expirationDate": "DD/MM/YYYY or empty",
  "category": "category",
  "confidence": "HIGH"
}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const responseText = result.text || '';

    // Clean up response - remove markdown code blocks
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const purifiedData = JSON.parse(cleanedResponse) as PurifiedData;

    // Validate essential fields
    if (!purifiedData.itemName) {
      throw new Error('Failed to extract item name');
    }

    return purifiedData;
  } catch (error) {
    console.error('Error purifying text with AI:', error);
    throw error instanceof Error ? error : new Error('Failed to purify extracted text with AI');
  }
};
