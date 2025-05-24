import type { NextApiRequest, NextApiResponse } from 'next';
import { validateIngredient } from '../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ingredientName, userId } = req.body;

  if (!ingredientName || !userId) {
    return res.status(400).json({ message: 'Missing ingredientName or userId' });
  }

  try {
    const result = await validateIngredient(ingredientName, userId);

    if (!result) {
      return res.status(500).json({ message: 'Failed to validate ingredient' });
    }

    // OpenAI 응답에서 JSON 문자열 파싱 (src/lib/openai.ts의 content는 JSON string)
    const parsed = JSON.parse(result);

    return res.status(200).json({
      isValid: parsed.isValid ?? false,
      possibleVariations: parsed.possibleVariations ?? [],
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 