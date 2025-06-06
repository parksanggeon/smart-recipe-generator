import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import Loading from '../components/Loading';
import StepComponent from '../components/Recipe_Creation/StepComponent';
import LimitReached from '../components/Recipe_Creation/LimitReached';
import { call_api, getServerSidePropsUtility } from '../utils/utils';
import { Ingredient, DietaryPreference, Recipe, IngredientDocumentType } from '../types/index';

const steps = [
  '재료 선택',
  '식단 선택',
  '레시피 리뷰 및 생성',
  '레시피 선택',
  '레시피 리뷰 및 저장',
];

const initialIngredients: Ingredient[] = [];
const initialPreferences: DietaryPreference[] = [];
const initialRecipes: Recipe[] = [];
const initialSelectedIds: string[] = [];

function Navigation({
  recipeCreationData,
}: {
  recipeCreationData: {
    ingredientList: IngredientDocumentType[];
    reachedLimit: boolean;
  };
}) {
  const [step, setStep] = useState(0);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [generatedRecipes, setGeneratedRecipes] = useState(initialRecipes);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loadingType, setLoadingType] = useState<'generation' | 'saving'>('generation');

  const router = useRouter();
  const { oldIngredients } = router.query;

  useEffect(() => {
    if (oldIngredients && Array.isArray(oldIngredients)) {
      setIngredients(
        oldIngredients.map((i) => ({ name: i, quantity: null, id: uuidv4() }))
      );
    }
  }, [oldIngredients]);

  const updateStep = (val: number) => {
    let newStep = step + val;
    if (newStep < 0 || newStep >= steps.length) newStep = 0;
    setStep(newStep);
  };

  const handleIngredientSubmit = async () => {
    try {
      setIsLoading(true);
      setIsComplete(false);
      setLoadingType('generation');

      const response = await call_api({
        address: '/api/generate-recipes',
        method: 'post',
        payload: {
          ingredients,
          dietaryPreferences: preferences,
        },
      });

      let parsedRecipes: Recipe[] = [];

      if (
        response &&
        typeof response === 'object' &&
        'recipes' in response
      ) {
        if (Array.isArray(response.recipes)) {
          parsedRecipes = response.recipes;
        } else if (
          typeof response.recipes === 'object' &&
          Array.isArray(response.recipes.recipes)
        ) {
          parsedRecipes = response.recipes.recipes;
        } else {
          console.error('API returned invalid recipes format:', response);
          setIsLoading(false);
          return;
        }
      } else {
        console.error('API returned invalid response:', response);
        setIsLoading(false);
        return;
      }

      const mappedRecipes = parsedRecipes.map((recipe: Recipe, idx: number) => ({
        ...recipe,
        openaiPromptId: `${response.recipes.openaiPromptId || 'unknown'}-${idx}`,
      }));

      setGeneratedRecipes(mappedRecipes);
      setIsComplete(true);

      setTimeout(() => {
        setIsLoading(false);
        setStep(step + 1);
      }, 500);
    } catch (error) {
      console.log("❌ Error during ingredient submission:", error);
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (recipes: Recipe[]) => {
    try {
      setIsLoading(true);
      setIsComplete(false);
      setLoadingType('saving');
      await call_api({
        address: '/api/save-recipes',
        method: 'post',
        payload: { recipes },
      });
      setIsComplete(true);

      setTimeout(() => {
        setIsLoading(false);
        setIngredients(initialIngredients);
        setPreferences(initialPreferences);
        setGeneratedRecipes(initialRecipes);
        setSelectedRecipeIds(initialSelectedIds);
        setStep(0);
        router.push('/Profile');
      }, 500);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const isWideLayout = step >= 3;

  return recipeCreationData.reachedLimit ? (
    <LimitReached
      message="You have reached the maximum number of interactions with our AI services. Please try again later."
      actionText="Go to Home"
      fullHeight
    />
  ) : (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-white p-8">
      <div className="fixed top-20 inset-x-0 flex flex-col items-center justify-center p-2 z-20">
        <div
          className={`w-full bg-white shadow-lg rounded-2xl p-8 transition-all duration-300 ease-in-out ${isWideLayout ? 'max-w-7xl' : 'max-w-3xl'}`}
        >
          <div className="flex flex-col items-center">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-800 sm:text-2xl md:text-3xl">
                {step + 1}단계: {steps[step]}
              </h2>
            </div>

            <div className="flex justify-between w-full mt-6">
              <button
                type="button"
                className={`flex items-center justify-center bg-gray-200 text-gray-700 rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 ${step === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => updateStep(-1)}
                disabled={step === 0}
                aria-label="이전 단계로 이동"
              >
                <ChevronLeftIcon className="block mr-2 h-5 w-5" />
                이전
              </button>

              <button
                type="button"
                className={`flex items-center justify-center bg-indigo-600 text-white rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${step === steps.length - 1 || (step === 2 && !generatedRecipes.length) ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => updateStep(+1)}
                disabled={step === steps.length - 1 || (step === 2 && !generatedRecipes.length)}
                aria-label="다음 단계로 이동"
              >
                다음
                <ChevronRightIcon className="block ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full pt-40 overflow-auto max-w-7xl">
        {isLoading ? (
          <Loading isProgressBar isComplete={isComplete} loadingType={loadingType} />
        ) : (
          <StepComponent
            step={step}
            ingredientList={recipeCreationData.ingredientList}
            ingredients={ingredients}
            updateIngredients={setIngredients}
            preferences={preferences}
            updatePreferences={setPreferences}
            editInputs={() => setStep(0)}
            handleIngredientSubmit={handleIngredientSubmit}
            generatedRecipes={generatedRecipes}
            updateSelectedRecipes={setSelectedRecipeIds}
            selectedRecipes={selectedRecipeIds}
            handleRecipeSubmit={handleRecipeSubmit}
          />
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return await getServerSidePropsUtility(context, 'api/get-ingredients', 'recipeCreationData');
};

export default Navigation;