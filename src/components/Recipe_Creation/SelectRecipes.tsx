import React from 'react';
import RecipeCard from '../RecipeCard';
import { Recipe } from '../../types/index';

interface SelectRecipesComponentProps {
    generatedRecipes: Recipe[];
    updateSelectedRecipes: (ids: string[]) => void;
    selectedRecipes: string[];
}

const SelectRecipesComponent = ({ generatedRecipes, selectedRecipes, updateSelectedRecipes }: SelectRecipesComponentProps) => {

    const handleRecipeSelection = (recipeId: string) => {
        const updatedSelections = selectedRecipes.includes(recipeId)
            ? selectedRecipes.filter((p) => p !== recipeId)  // 선택 해제
            : [...selectedRecipes, recipeId];                 // 선택 추가
        updateSelectedRecipes(updatedSelections);
    };

    return (
        <div className="flex flex-col">
            {/* 안내 문구 /}
            <p className="text-center text-gray-500 text-sm mb-4">
                각 레시피의 스위치를 사용하여 선택하거나 선택 해제하세요.
            </p>

            {/ 반응형 레시피 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe) => (
                    <div key={recipe.openaiPromptId}>
                        <RecipeCard
                            recipe={recipe}
                            handleRecipeSelection={handleRecipeSelection}
                            selectedRecipes={selectedRecipes}
                            showSwitch
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectRecipesComponent;