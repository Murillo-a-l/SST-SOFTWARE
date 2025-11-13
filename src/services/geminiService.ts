import { GoogleGenerativeAI } from "@google/generative-ai";

export type GeminiError = { code?: string; message: string };

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function assertApiKey() {
  if (!apiKey) {
    throw { message: "Chave da API ausente. Configure VITE_GEMINI_API_KEY." } as GeminiError;
  }
}

let client: any = null;

function getModel() {
  assertApiKey();
  if (client) return client;

  const genAI = new GoogleGenerativeAI(apiKey);
  client = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return client;
}

export async function summarizeText(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return "Texto vazio.";
  }
  try {
    const model = getModel();
    const res = await model.generateContent(
      "Resuma este texto para medicina do trabalho:\n\n" + text
    );
    return res.response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw { message: error.message || "Erro desconhecido ao contatar a IA." } as GeminiError;
  }
}

export async function suggestExams(employee: any): Promise<string> {
  try {
    const model = getModel();
    const prompt =
      "Você é um assistente de Medicina do Trabalho no Brasil. Sugira exames ocupacionais com base nos dados abaixo.\n\n" +
      JSON.stringify(employee, null, 2);

    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw { message: error.message || "Erro desconhecido ao contatar a IA." } as GeminiError;
  }
}