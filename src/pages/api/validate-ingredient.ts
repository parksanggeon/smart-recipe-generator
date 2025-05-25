import type { NextApiRequest, NextApiResponse } from 'next';

type ValidationResult = {
  message: string;
  newIngredient: {
    _id: string;
    name: string;
    createdBy: string;
    createdAt: string;
  };
  suggested: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ingredientName } = req.body ?? {};

  if (typeof ingredientName !== 'string' || !ingredientName.trim()) {
    return res.status(400).json({ message: 'Invalid or missing ingredientName' });
  }

  try {
    // DB 저장 없이 가짜 데이터 반환
    const newIngredient = {
      _id: 'mock-id',
      name: ingredientName,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json({
      message: 'Success',
      newIngredient,
      suggested: ['garlic', 'scallion'],
    } as ValidationResult);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
