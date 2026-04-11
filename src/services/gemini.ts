import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message } from "../types";

export async function sendMessage(
  messages: Message[],
  userName: string,
  userAppearance: string,
  apiKey: string,
  modelName: string = "gemini-flash-latest",
  additionalSystemPrompt: string = ""
) {
  const ai = new GoogleGenAI({ apiKey });
  const history = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content.replace(/{{user}}/g, userName) }],
  }));

  const systemInstruction = additionalSystemPrompt + SYSTEM_PROMPT.replace(/{{user}}/g, userName).replace(
    /{{user_appearance}}/g,
    userAppearance
  ) + `\n\nThông tin người dùng hiện tại:\nTên: ${userName}\nNgoại hình: ${userAppearance}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string, modelName: string = "gemini-flash-latest") {
  const ai = new GoogleGenAI({ apiKey });
  try {
    // We use a very simple call to check if the key is valid
    await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      config: {
        maxOutputTokens: 1,
      }
    });
    return true;
  } catch (error: any) {
    console.error("API Key validation failed:", error);
    return false;
  }
}
