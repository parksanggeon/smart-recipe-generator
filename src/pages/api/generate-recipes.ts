import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { generateRecipe } from '../../lib/openai';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        console.info('Generating recipes from OpenAI...');
        const rawRecipes = await generateRecipe(ingredients, dietaryPreferences, session.user.id);

        let recipes;

        try {
            // recipes가 문자열인 경우 JSON 파싱
            recipes = typeof rawRecipes === 'string' ? JSON.parse(rawRecipes) : rawRecipes;
        } catch (e) {
            console.error('Failed to parse OpenAI response as JSON:', e);
            return res.status(500).json({ error: 'OpenAI returned invalid JSON' });
        }

        res.status(200).json({ recipes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};  

export default apiMiddleware(['POST'], handler);

