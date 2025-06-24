// src/services/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY
});

export const generateRecommendations = async (
  prompt: string,
  goals: any[],
  journal: any[]
) => {
  try {
    // Send to backend API endpoint instead of OpenAI directly
    const response = await fetch('/api/openai/recommendations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, goals, journal }),
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate recommendations');
  }
};