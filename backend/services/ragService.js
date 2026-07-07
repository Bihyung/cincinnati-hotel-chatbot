import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";
import embeddingService from "./embeddingService.js";
import Document from "../models/Document.js";

console.log('DEBUG: OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('DEBUG: OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class RAGService {
  async searchRelevantChunks(query, topK = 3) {
    // Get active document
    const document = await Document.findOne({ active: true });
    if (!document || !document.chunks || document.chunks.length === 0) {
      return null;
    }

    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Calculate similarity scores
    const scored = document.chunks.map((chunk) => ({
      text: chunk.text,
      score: embeddingService.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort and return top K
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async categorizeQuestion(question) {
    // Use OpenAI to categorize the question into topics
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Categorize this hotel-related question into ONE of these categories: Rooms, Dining, Amenities, Pricing, Location, Policies, Events, Services, General, Other. Reply with only the category name.`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error categorizing question:", error);
      return "General";
    }
  }

  async generateAnswer(question, context, conversationHistory = []) {
    const systemPrompt = context
      ? `You are the Cincinnati Hotel's AI assistant. Answer questions based ONLY on the provided hotel information. If the answer is not in the context, politely say you don't have that information and suggest the guest can leave their contact details for a customer service representative to follow up.

Hotel Information:
${context}

Remember: Be friendly, professional, and only answer based on the information provided.`
      : `You are the Cincinnati Hotel's AI assistant. I don't have the hotel information document loaded yet. Please inform guests that the information is currently being updated and they can leave their contact details for assistance.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: question },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      return response;
    } catch (error) {
      console.error("Error generating answer:", error);
      throw error;
    }
  }

  async checkIfAnswered(answer) {
    // Simple heuristic: if the answer contains phrases indicating uncertainty
    const uncertainPhrases = [
      "don't have that information",
      "not in the context",
      "unable to find",
      "don't know",
      "cannot find",
      "not available",
      "contact.*customer service",
      "reach out.*representative",
    ];

    const lowerAnswer = answer.toLowerCase();
    return !uncertainPhrases.some((phrase) =>
      new RegExp(phrase).test(lowerAnswer),
    );
  }
}

export default new RAGService();
