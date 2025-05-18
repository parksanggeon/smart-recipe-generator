// src/lib/openai.ts

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

// 환경변수 체크
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 재료 유효성 검사 함수
 */
export const validateIngredient = async (
  ingredientName: string,
  userId: string
): Promise<{ isValid: boolean; possibleVariations: string[] }> => {
  const prompt = `Is "${ingredientName}" a valid cooking ingredient? Respond ONLY in JSON format like:
{
  "isValid": true,
  "possibleVariations": ["variation1", "variation2"]
}`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });
  const content = res.choices[0].message?.content?.trim();
  if (!content) throw new Error('No content from OpenAI');
  try {
    const parsed = JSON.parse(content);
    return {
      isValid: Boolean(parsed.isValid),
      possibleVariations: Array.isArray(parsed.possibleVariations)
        ? parsed.possibleVariations
        : [],
    };
  } catch {
    return { isValid: false, possibleVariations: [] };
  }
};

/**
 * 레시피 생성 함수
 */
export const generateRecipe = async (
  ingredients: { name: string }[],
  dietaryPreferences: string[],
  userId: string
): Promise<{ recipes: string; totalTokens: number }> => {
  const ingredientList = ingredients.map(i => i.name).join(', ');
  const dietList = dietaryPreferences.join(', ');
  const prompt = `Generate a detailed recipe using ingredients: ${ingredientList}${
    dietList ? ' and dietary preferences: ' + dietList : ''
  }`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    });
    return {
      recipes: res.choices[0].message?.content?.trim() || '',
      totalTokens: res.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    if (error.status === 429) {
      console.error('❗ OpenAI quota exceeded.');
      throw new Error('요금제 한도를 초과했습니다. OpenAI 대시보드에서 확인해 주세요.');
    } else {
      console.error('❗ GPT 호출 실패:', error.message);
      throw new Error('GPT 호출 중 문제가 발생했습니다.');
    }
  }
};


/**
 * ChatGPT 대화 응답 생성기
 */
export const generateChatResponse = async (
  message: string,
  recipe: { name: string },
  history: ChatCompletionMessageParam[],
  userId: string
): Promise<{ reply: string; totalTokens: number }> => {
  const systemPrompt = `You are an assistant for recipe: ${recipe.name}`;
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 500,
  });
  return {
    reply: res.choices[0].message?.content?.trim() || '',
    totalTokens: res.usage?.total_tokens || 0,
  };
};

/**
 * 레시피별 이미지 생성 함수
 */
export const generateImages = async (
  recipes: { name: string; ingredients: string[] }[],
  userId: string
): Promise<{ name: string; imgLink: string }[]> => {
  const results = await Promise.all(
    recipes.map(async (r) => {
      const prompt = `Create a photo of "${r.name}" showing ingredients: ${r.ingredients.join(
        ', '
      )}.`;
      const imgRes = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });
      return { name: r.name, imgLink: imgRes.data[0].url! };
    })
  );
  return results;
};

/**
 * 레시피 태그 생성 함수
 */
export const generateRecipeTags = async (
  recipe: { name: string; ingredients: string[]; instructions: string },
  userId: string
): Promise<string[]> => {
  const prompt = `Given this recipe:
Name: ${recipe.name}
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions}

Provide a JSON array of tags, e.g. ["vegan","gluten free"].`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });
  const content = res.choices[0].message?.content || '[]';
  try {
    const tags = JSON.parse(content);
    return Array.isArray(tags) ? tags.map((t) => String(t)) : [];
  } catch {
    return [];
  }
};
