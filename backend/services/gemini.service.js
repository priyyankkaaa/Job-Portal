import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({
  path: path.resolve("../.env"),
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const callGemini = async (promptText) => {
  let lastError;

  for (let i = 0; i < 3; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: promptText,
      });

      return response.text;
    } catch (error) {
      lastError = error;

      if (error.status !== 503) {
        throw error;
      }

      // wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw lastError;
};