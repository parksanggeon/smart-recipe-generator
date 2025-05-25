import mongoose from 'mongoose';

export type Ingredient = {
    name: string
    quantity?: number | null
    id: string
}

export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Paleo';

interface RecipeIngredient {
    name: string;
    quantity: string;
}

interface AdditionalInformation {
    tips: string;
    variations: string;
    servingSuggestions: string;
    nutritionalInformation: string;
}

export interface Recipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    dietaryPreference: string[];
    additionalInformation: AdditionalInformation;
    openaiPromptId: string;
}

interface tagType {
    _id: string;
    tag: string;
}

interface unPopulatedComment {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    comment: string;
    createdAt: string;
}

export interface RecipeDocument extends Recipe {
    owner: mongoose.Types.ObjectId;
    imgLink: string;
    likedBy: mongoose.Types.ObjectId[];
    comments: unPopulatedComment[];
    createdAt: string;
    tags: tagType[];
    audio?: string;
}

export interface ExtendedRecipe extends Recipe {
    _id: string;
    imgLink: string;
    owner: {
        _id: string;
        name: string;
        image: string;
    };
    createdAt: string;
    updatedAt: string;
    likedBy: {
        _id: string;
        name: string;
        image: string;
    }[];
    owns: boolean;
    liked: boolean;
    audio?: string;
    tags: tagType[];
}

export interface IngredientDocumentType {
    _id: string;
    name: string;
    createdBy: string | null;
    createdAt: string;
}

export interface UploadReturnType {
    location: string;
    uploaded: boolean;
}

export interface NotificationType {
    _id: string;
    userId: mongoose.Schema.Types.ObjectId;
    initiatorId: mongoose.Schema.Types.ObjectId;
    type: 'like' | 'comment' | 'update';
    recipeId: mongoose.Schema.Types.ObjectId;
    message: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationQueryType {
    page?: string;
    limit?: string;
    sortOption?: string;
    query?: string;
}
