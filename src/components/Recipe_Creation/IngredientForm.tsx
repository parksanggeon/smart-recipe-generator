import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import NewIngredientDialog from './NewIngredientDialog';
import { Ingredient, Recipe, IngredientDocumentType } from '../../types/index';

type ComboIngredient = { id: number; name: string };

const initialComboIngredient: ComboIngredient = { id: 0, name: '' };

const Chip = ({ ingredient, onDelete }: { ingredient: Ingredient; onDelete: (id: string) => void }) => {
    return (
        <div className="flex items-center bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-full m-1">
            <span>{`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}</span>
            <button onClick={() => onDelete(ingredient.id as string)} className="ml-2 focus:outline-none">
                <XMarkIcon className="w-4 h-4 text-white hover:text-gray-200" />
            </button>
        </div>
    );
};

interface IngredientListProps {
    ingredientList: IngredientDocumentType[];
    ingredientUpdate: (val: string | undefined) => void;
    generatedRecipes: Recipe[];
}

function IngredientList({ ingredientList, ingredientUpdate, generatedRecipes }: IngredientListProps) {
    const [selectedIngredient, setSelectedIngredient] = useState(initialComboIngredient);
    const [query, setQuery] = useState('');

    const filteredIngredients: IngredientDocumentType[] =
        query === ''
            ? ingredientList
            : ingredientList.filter((ingredient) =>
                ingredient.name.toLowerCase().includes(query.toLowerCase())
            );

    const handleSelectedIngredient = (ingredient: ComboIngredient) => {
        if (ingredient && ingredient.name) {
            setSelectedIngredient(initialComboIngredient);
            ingredientUpdate(ingredient.name);
        } else {
            console.error("Invalid ingredient:", ingredient);
        }
    };

    return (
        <div className="relative w-full">
            <Combobox
                value={selectedIngredient}
                onChange={handleSelectedIngredient}
                onClose={() => setQuery('')}
                disabled={Boolean(generatedRecipes.length)}
            >
                <div className="relative w-full">
                    <ComboboxInput
                        className={clsx(
                            'w-full rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        )}
                        displayValue={(ingredient: ComboIngredient) => ingredient?.name}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="기존 재료 선택" // 🔥 한글화: 기존 재료 선택
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                </div>

                {filteredIngredients?.length > 0 && (
                    <ComboboxOptions
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    >
                        {filteredIngredients.map((ingredient) => (
                            <ComboboxOption
                                key={ingredient._id}
                                value={ingredient}
                                className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'text-white bg-indigo-600' : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ focus, selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                }`}
                                        >
                                            {ingredient.name}
                                        </span>
                                        {selected && (
                                            <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${focus ? 'text-white' : 'text-indigo-600'
                                                    }`}
                                            >
                                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                )}
            </Combobox>
        </div>
    );
}

interface IngredientFormProps {
    ingredientList: IngredientDocumentType[];
    ingredients: Ingredient[];
    updateIngredients: (ingredients: Ingredient[]) => void;
    generatedRecipes: Recipe[];
}

export default function IngredientForm({
    ingredientList: originalIngredientList,
    ingredients,
    updateIngredients,
    generatedRecipes,
}: IngredientFormProps) {
    const [ingredientList, setIngredientList] = useState(originalIngredientList);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (val: string | undefined) => {
        if (!val || val.trim() === '') return;
        const isRepeat = ingredients.some(
            (i) => i.name.toLowerCase() === val.toLowerCase()
        );
        if (isRepeat) {
            setError('이 재료는 이미 선택되었습니다.'); // 🔥 한글화: 중복 선택
            return;
        }
        if (ingredients.length >= 10) {
            setError('최대 10개의 재료만 선택할 수 있습니다.'); // 🔥 한글화: 선택 제한
            return;
        }
        setError(null);
        updateIngredients([ ...ingredients, { name: val, id: uuidv4() } ]);
    };

    const deleteIngredient = (id: string) => {
        if (generatedRecipes.length > 0) return;
        updateIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
    };

    return (
        <div
            className="fixed top-36 mt-32 pl-2 left-1/2 transform -translate-x-1/2 px-4 py-6 bg-white shadow-md rounded-xl sm:max-w-md mx-auto"
            style={{ width: '98%' }}
        >
            <div className="flex justify-end w-full">
                <NewIngredientDialog
                    ingredientList={ingredientList}
                    updateIngredientList={(newIngredient) => setIngredientList([...ingredientList, newIngredient])}
                />
            </div>
            <div className="mt-4 w-full">
                <IngredientList
                    ingredientList={ingredientList}
                    ingredientUpdate={(val) => handleChange(val)}
                    generatedRecipes={generatedRecipes}
                />
                {error && (
                    <p className="mt-2 text-red-500 text-sm">
                        {error}
                    </p>
                )}
            </div>
            {ingredients.length > 0 && (
                <div className="mt-6 w-full">
                    <h2 className="text-lg font-semibold text-indigo-600 mb-3">선택된 재료:</h2> {/* 🔥 한글화: 재료 리스트 제목 */}
                    <div className="flex flex-wrap max-h-32 overflow-y-auto">
                        {ingredients.map((ingredient: Ingredient) => (
                            <Chip
                                ingredient={ingredient}
                                key={ingredient.id}
                                onDelete={(id: string) => deleteIngredient(id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
