import OpenAI from 'openai';
import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index';
import aiGenerated from '../models/aigenerated';
import { connectDB } from '../lib/mongodb';
import { ImagesResponse } from 'openai/resources';
import recipeModel from '../models/recipe';
import {
    getRecipeGenerationPrompt,
    getImageGenerationPrompt,
    getIngredientValidationPrompt,
    getRecipeNarrationPrompt,
    getRecipeTaggingPrompt,
    getChatAssistantSystemPrompt
} from './prompts';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// DB 저장 함수
type SaveOpenaiResponsesType = {
    userId: string;
    prompt: string;
    response: any;
    model?: string;
};

const saveOpenaiResponses = async ({ userId, prompt, response, model }: SaveOpenaiResponsesType) => {
    try {
        await connectDB();
        const { _id } = await aiGenerated.create({
            userId,
            prompt,
            response,
            model,
        });
        return _id;
    } catch (error) {
        console.error('DB 저장 실패:', error);
        return null;
    }
};

// 레시피 생성
type ResponseType = {
    recipes: any | null;
    openaiPromptId: string;
};

export const generateRecipe = async (
    ingredients: Ingredient[],
    dietaryPreferences: DietaryPreference[],
    userId: string
): Promise<ResponseType> => {
    try {
        const prompt = getRecipeGenerationPrompt(ingredients, dietaryPreferences);
        const model = 'gpt-4o';

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: '모든 응답은 반드시 한국어로 작성하고, JSON 형식으로만 작성해 주세요. 추가 설명이나 코드 블록 없이 순수 JSON만 반환해 주세요.'
            },
            {
                role: 'user',
                content: prompt,
            }
        ];

        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1500,
            temperature: 0.2,
        });

        const _id = await saveOpenaiResponses({ userId, prompt, response, model });

        const content = response.choices[0].message?.content || '';
        const cleanedContent = content.replace(/```json|```/g, '').trim();

        let parsedRecipes = null;
        try {
            parsedRecipes = JSON.parse(cleanedContent);
        } catch (e) {
            console.error('JSON 파싱 실패:', e);
            console.error('원본 응답:', content);
        }

        return { recipes: parsedRecipes, openaiPromptId: _id || 'null-prompt-id' };
    } catch (error) {
        console.error('레시피 생성 실패:', error);
        throw new Error('레시피 생성에 실패했습니다.');
    }
};

// 이미지 생성
const generateImage = (prompt: string, model: string): Promise<ImagesResponse> => {
    try {
        return openai.images.generate({
            model,
            prompt,
            n: 1,
            size: '1024x1024',
        });
    } catch (error) {
        throw new Error('이미지 생성 실패');
    }
};

export const generateImages = async (recipes: Recipe[], userId: string) => {
    try {
        const model = 'dall-e-3';
        const imagePromises: Promise<ImagesResponse>[] = recipes.map(recipe =>
            generateImage(getImageGenerationPrompt(recipe.name, recipe.ingredients), model)
        );
        const images = await Promise.all(imagePromises);

        await saveOpenaiResponses({
            userId,
            prompt: `레시피 이미지 생성: ${recipes.map(r => r.name).join(', ')}`,
            response: images,
            model,
        });

        return images.map((imageResponse, idx) => ({
            imgLink: imageResponse.data[0].url,
            name: recipes[idx].name,
        }));
    } catch (error) {
        console.error('이미지 생성 오류:', error);
        throw new Error('이미지 생성 실패');
    }
};

// 재료 검증
export const validateIngredient = async (ingredientName: string, userId: string): Promise<string | null> => {
    try {
        const prompt = getIngredientValidationPrompt(ingredientName);
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'user',
                content: prompt,
            }
        ];
        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 800,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content || null;
    } catch (error) {
        console.error('재료 검증 실패:', error);
        throw new Error('재료 검증에 실패했습니다.');
    }
};

// 레시피 내레이션
const getRecipeNarration = async (recipe: ExtendedRecipe, userId: string): Promise<string | null> => {
    try {
        const prompt = getRecipeNarrationPrompt(recipe);
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt }
        ];
        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1500,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content || null;
    } catch (error) {
        console.error('레시피 내레이션 생성 실패:', error);
        throw new Error('레시피 내레이션 생성에 실패했습니다.');
    }
};

// TTS
export const getTTS = async (recipe: ExtendedRecipe, userId: string): Promise<Buffer> => {
    try {
        const text = await getRecipeNarration(recipe, userId);
        if (!text) throw new Error('내레이션 텍스트를 얻을 수 없습니다.');

        type voiceTypes = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        const voiceChoices: voiceTypes[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const voice = voiceChoices[Math.floor(Math.random() * voiceChoices.length)];

        const model = 'tts-1';
        const mp3 = await openai.audio.speech.create({
            model,
            voice,
            input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await saveOpenaiResponses({ userId, prompt: text, response: mp3, model });
        return buffer;
    } catch (error) {
        console.error('TTS 생성 실패:', error);
        throw new Error('TTS 생성에 실패했습니다.');
    }
};

// 레시피 태그
export const generateRecipeTags = async (recipe: ExtendedRecipe, userId: string): Promise<void> => {
    try {
        const prompt = getRecipeTaggingPrompt(recipe);
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt }
        ];
        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1500,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });

        const rawTags = response.choices[0].message?.content?.trim() || '';
        let tagsArray: string[] = [];

        try {
            tagsArray = JSON.parse(rawTags);
            if (!Array.isArray(tagsArray) || tagsArray.some(tag => typeof tag !== 'string')) {
                throw new Error('올바른 문자열 배열 형태가 아닙니다.');
            }
        } catch (jsonError) {
            console.error('JSON 파싱 오류:', jsonError);
            console.error('받은 태그 원본:', rawTags);
            throw new Error(`태그 JSON 파싱 실패: ${jsonError}`);
        }

        if (tagsArray.length) {
            const tags = tagsArray.map(tag => ({ tag: tag.toLowerCase() }));
            await recipeModel.findByIdAndUpdate(recipe._id, { $set: { tags } });
        }
    } catch (error) {
        console.error('태그 생성 실패:', error);
        throw new Error(`태그 생성 실패: ${error}`);
    }
};

// 채팅 응답
export const generateChatResponse = async (
    message: string,
    recipe: ExtendedRecipe,
    history: ChatCompletionMessageParam[],
    userId: string
): Promise<{ reply: string; totalTokens: number }> => {
    try {
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: getChatAssistantSystemPrompt(recipe) },
            ...history,
            { role: 'user', content: message },
        ];

        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1000,
        });

        const reply = response.choices?.[0]?.message?.content ?? '죄송합니다, 답변을 생성하지 못했습니다.';
        const totalTokens = response.usage?.total_tokens ?? 0;

        if (history.length === 1) {
            await saveOpenaiResponses({
                userId,
                prompt: `레시피: ${recipe.name} 채팅 시작, 첫 메시지: ${message}`,
                response,
                model,
            });
        }

        return { reply, totalTokens };
    } catch (error) {
        console.error('채팅 응답 생성 실패:', error);
        return { reply: '죄송합니다, 답변을 생성하지 못했습니다.', totalTokens: 0 };
    }
};