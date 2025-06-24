// src/services/api/openai.ts
import { Request, Response } from 'express'; // or your framework
import { generateRecommendations } from '../openai';

export const openaiHandler = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, goals, journal } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateRecommendations(prompt, goals, journal);
    
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};