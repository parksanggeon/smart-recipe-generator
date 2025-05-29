import React, { useEffect, useState } from 'react';
import RecipeCard from '../RecipeCard';
import { Button } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../../types/index'

interface ReviewRecipesComponentProps {
    generatedRecipes: Recipe[]
    selectedRecipes: string[]
    handleRecipeSubmit: (recipes: Recipe[]) => void
}

const initialRecipes: Recipe[] = [];

const ReviewRecipesComponent = ({ generatedRecipes, selectedRecipes, handleRecipeSubmit }: ReviewRecipesComponentProps) => {
    const [finalRecipes, setFinalRecipes] = useState(initialRecipes)

    useEffect(() => {
        const recipes = generatedRecipes.filter((recipe) => selectedRecipes.includes(recipe.openaiPromptId))
        setFinalRecipes(recipes)
    }, [generatedRecipes, selectedRecipes])

    return (
        <div className="flex flex-col mt-10">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    finalRecipes.map((recipe) => (
                        <RecipeCard
                            recipe={recipe}
                            key={recipe.openaiPromptId}
                            selectedRecipes={selectedRecipes}
                        />
                    ))
                }
            </div>
            <div className="mt-8 w-full flex justify-center">
                {finalRecipes.length ? (
                    <Button
                        onClick={() => handleRecipeSubmit(finalRecipes)}
                        className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                        aria-label="선택한 레시피 제출"
                    >
                        <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        {`선택한 레시피 ${finalRecipes.length}개 제출`}
                    </Button>
                ) : (
                    <div className="text-center text-red-500 font-medium px-4 py-3 rounded-lg bg-red-100">
                        제출할 레시피가 선택되지 않았습니다. 최소한 한 개 이상의 레시피를 선택해 주세요.  
                        다른 페이지로 이동하면 모든 레시피가 삭제됩니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewRecipesComponent;