import { useState, useEffect } from 'react';
import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { DietaryPreference, Recipe } from '../../types/index';

const dietaryOptions: DietaryPreference[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Paleo',
];

// 한글 매핑 객체
const dietaryOptionLabels: Record<DietaryPreference, string> = {
  'Vegetarian': '채식주의',
  'Vegan': '비건',
  'Gluten-Free': '글루텐프리',
  'Keto': '키토',
  'Paleo': '팔레오',
};

interface DietaryPreferencesProps {
  preferences: DietaryPreference[];
  updatePreferences: (preferences: DietaryPreference[]) => void;
  generatedRecipes: Recipe[];
}

export default function DietaryPreferences({
  preferences,
  updatePreferences,
  generatedRecipes,
}: DietaryPreferencesProps) {
  const [noPreference, setNoPreference] = useState(false);

  useEffect(() => {
    if (!preferences.length) {
      setNoPreference(true);
    } else {
      setNoPreference(false);
    }
  }, [preferences.length]);

  const handlePreferenceChange = (checked: boolean, option: DietaryPreference) => {
    const updatedPreferences = preferences.includes(option)
      ? preferences.filter((p) => p !== option)
      : [...preferences, option];
    updatePreferences(updatedPreferences);
  };

  const handleNoPreference = () => {
    setNoPreference(!noPreference);
    updatePreferences([]);
  };

  return (
    <div
      className="fixed top-36 mt-32 pl-2 left-1/2 transform -translate-x-1/2 px-4 py-6 bg-white shadow-md rounded-xl sm:max-w-md mx-auto"
      style={{ width: '98%' }}
    >
      {/* 제목 */}
      <h2 className="text-xl font-medium text-gray-800 mb-4 sm:text-2xl">
        식단 선호도
      </h2>

      {/* '선호 없음' 옵션 */}
      <div className="flex items-center mb-4">
        <Checkbox
          checked={noPreference}
          onChange={handleNoPreference}
          className={`h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${
            noPreference ? 'bg-indigo-600' : 'bg-white'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          disabled={Boolean(generatedRecipes.length)}
          aria-label="식단 선호 없음"
        >
          {noPreference && <CheckIcon className="h-3 w-3 text-white" />}
        </Checkbox>
        <span className="ml-3 text-gray-700">선호 없음</span>
      </div>

      <hr className="mb-4" />

      {/* 식단 옵션 목록 */}
      <div className="flex flex-wrap gap-3">
        {dietaryOptions.map((option) => (
          <div key={option} className="flex items-center">
            <Checkbox
              checked={preferences.includes(option)}
              onChange={(e) => handlePreferenceChange(e, option)}
              className={`h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${
                preferences.includes(option) ? 'bg-indigo-600' : 'bg-white'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={noPreference || Boolean(generatedRecipes.length)}
              aria-label={option}
            >
              {preferences.includes(option) && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
            </Checkbox>
            {/* 한글 라벨 출력 */}
            <span className="ml-3 text-gray-700">{dietaryOptionLabels[option]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}