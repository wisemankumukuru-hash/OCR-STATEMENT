
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

export const extractStatementData = async (base64Image: string, mimeType: string): Promise<OCRResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this bank statement image. Extract all transactions.
    Ensure amounts are positive for deposits/credits and negative for withdrawals/debits if possible, 
    or simply extract the absolute value if the sign is unclear.
    If the date is in a specific format like DD/MM/YY, keep it consistent.
    For each transaction, provide:
    - date: The date of the transaction.
    - description: The full title or description of the transaction.
    - amount: The numeric value.
    - notes: Any additional info like categories, reference numbers, or merchant locations found.
    
    Also extract the bank name and statement period if visible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING },
            period: { type: Type.STRING },
            currency: { type: Type.STRING },
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  notes: { type: Type.STRING }
                },
                required: ["date", "description", "amount"]
              }
            }
          },
          required: ["transactions"]
        },
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No data returned from Gemini");
    
    return JSON.parse(resultText) as OCRResult;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
