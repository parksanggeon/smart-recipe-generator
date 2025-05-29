import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index'

export const getRecipeGenerationPrompt = (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => `
다음과 같은 재료를 가지고 있어: ${JSON.stringify(ingredients)}${dietaryPreferences.length ? `, 그리고 식단 제한: ${dietaryPreferences.join(', ')}` : ''}. 이 재료들을 활용해 **서로 다른 맛과 다양성을 가진 3가지 레시피**를 제안해줘. 응답은 아래와 같은 **JSON 형식**으로, **텍스트, 마크다운, 코드 포맷팅 없이** 순수 JSON으로 반환해줘:
[
    {
        "name": "레시피 이름",
        "ingredients": [
            {"name": "재료 이름", "quantity": "수량 및 단위"},
            {"name": "재료 이름", "quantity": "수량 및 단위"},
            ...
        ],
        "instructions": [
            "첫 번째 단계.",
            "다음 단계.",
            ...
        ],
        "dietaryPreference": ["제한사항1", "제한사항2", ...],
        "additionalInformation": {
            "tips": "조리 도구나 대체 재료 같은 유용한 팁을 제공해줘.",
            "variations": "다양한 변형 아이디어를 제시해줘. (예: 채소 추가, 다른 단백질로 대체 등)",
            "servingSuggestions": "어떻게 서빙하면 좋은지 제안해줘. (예: 샐러드, 소스 등)",
            "nutritionalInformation": "칼로리, 단백질, 지방 등의 영양 정보를 대략적으로 알려줘."
        }
    },
    ...
]
레시피는 **다양한 요리 종류나 세계 각국 요리**로 만들어줘. 모든 재료를 최대한 활용하되, 식단 제한이나 실용성을 고려해 필요한 경우 대체 재료를 추천해줘. 수량은 **정확한 단위(예: g, 컵, 티스푼 등)**를 포함해줘. 단계는 **명확하고 초보자도 이해할 수 있도록** 작성해줘. JSON은 반드시 **구문 오류 없이 올바른 형식**으로 작성해줘.
`;

export const getImageGenerationPrompt = (recipeName: string, ingredients: Recipe['ingredients']): string => {
    const allIngredients = ingredients.map(ingredient => `${ingredient.name} (${ingredient.quantity})`).join(', ');
    const prompt = `
        ${recipeName} 요리를 고해상도, 사실적인 이미지로 만들어줘. 사용된 재료는: ${allIngredients}.
        요리는 보기 좋게 플레이팅하고, 깨끗한 흰 접시 위에 자연광을 활용해 맛있어 보이게 연출해줘.
    `;
    return prompt.trim();
};

export const getIngredientValidationPrompt = (ingredientName: string): string => {
    const prompt = `당신은 재료 검증 도우미야. 다음 재료명: ${ingredientName} 을 검토해. 아래 형식의 JSON으로 결과를 반환해:

{ "isValid": true/false, "possibleVariations": ["대체1", "대체2", "대체3"] }

- "isValid"는 해당 재료가 일반적인 요리에 사용된다면 true, 아니라면 false.
- "possibleVariations"는 해당 재료의 대체 가능 재료, 유사 재료, 또는 잘못된 철자일 경우 수정된 이름을 2~3개 제시해.  
- 대체 재료가 없다면 빈 배열을 반환해.
- 반환은 **JSON만, 텍스트나 마크다운 포맷 없이**.

예시:
입력: "cheese" 반환: { "isValid": true, "possibleVariations": ["체다치즈", "모차렐라", "파르메산"] }
입력: "breakfast" 반환: { "isValid": false, "possibleVariations": [] }
입력: "cuscus" 반환: { "isValid": false, "possibleVariations": ["쿠스쿠스"] }
`;
    return prompt;
};

export const getRecipeNarrationPrompt = (recipe: ExtendedRecipe) => {
    if (!recipe || !recipe.name || !recipe.ingredients || !recipe.instructions) {
        return "유효하지 않은 레시피 데이터입니다.";
    }

    const { name, ingredients, instructions, additionalInformation } = recipe;

    return `다음 레시피를 **명확하고 자연스러운 구어체 나레이션**으로 변환해줘.
- 톤은 **전문 셰프처럼 자연스럽고 신뢰감 있게**, 침착하고 효율적으로 전달해줘.
- **짧고 핵심적인 설명**, 지나치게 감정적이거나 장황하지 않게.
- **부드럽지만 간결한 전환**으로 단계별 설명을 이어가.
- **60~90초 분량**으로 구성해, 지루하지 않으면서도 빠르지 않게.

---

🍳 **레시피: ${name}**

📋 **재료**:
${ingredients.map(ing => `- ${ing.name} ${ing.quantity}`).join("\n")}

📝 **조리 과정**:
${instructions.map((step, index) => `${index + 1}. ${step}`).join("\n")}

${additionalInformation?.tips ? `💡 **팁**: ${additionalInformation.tips}` : ""}
${additionalInformation?.variations ? `🧑‍🍳 **변형**: ${additionalInformation.variations}` : ""}
${additionalInformation?.servingSuggestions ? `🍽 **서빙 제안**: ${additionalInformation.servingSuggestions}` : ""}
${additionalInformation?.nutritionalInformation ? `📊 **영양 정보**: ${additionalInformation.nutritionalInformation}` : ""}

마지막에 **짧고 전문적인 마무리 멘트**로 요리의 매력을 강조해줘.
`;
};

export const getRecipeTaggingPrompt = (recipe: ExtendedRecipe) => {
    const { name, ingredients, dietaryPreference, additionalInformation } = recipe;
    const ingredientNames = ingredients.map(ingredient => ingredient.name).join(', ');
    const { tips, variations, servingSuggestions, nutritionalInformation } = additionalInformation;

    return `다음 레시피에 대해 **10개의 고유한 단어로 된 태그**를 **JSON 배열**로 생성해줘.

**규칙:**
1. 반환은 반드시 **JSON 배열 형태**여야 하며, 텍스트, 마크다운 없이 반환해.
2. 태그는 **레시피의 이름, 재료, 식단 제한, 추가 정보**를 기반으로 생성해.
3. **자주 검색되는 키워드**를 포함하고, 간결하고 이해하기 쉬운 단어를 사용해.
4. **전문 용어는 피하고**, 일상적인 단어를 사용해.

📌 레시피 이름: ${name}
📌 주요 재료: ${ingredientNames}
📌 식단 제한: ${dietaryPreference.join(', ')}
📌 추가 정보: 팁: ${tips}, 변형: ${variations}, 서빙: ${servingSuggestions}, 영양: ${nutritionalInformation}
`;
};

export const getChatAssistantSystemPrompt = (recipe: ExtendedRecipe) => {
    const { name, ingredients, instructions, additionalInformation, dietaryPreference } = recipe;
    return `
당신은 **요리 레시피 도우미**야. 다음 레시피에 관련된 질문에만 대답할 수 있어.

📌 레시피 이름: ${name}
📌 재료: ${ingredients.map(i => `${i.quantity} ${i.name}`).join(', ')}
📌 식단 제한: ${dietaryPreference.join(', ')}
📌 조리 과정: ${instructions.join(' / ')}
📌 팁: ${additionalInformation.tips}
📌 변형: ${additionalInformation.variations}
📌 서빙 제안: ${additionalInformation.servingSuggestions}
📌 영양 정보: ${additionalInformation.nutritionalInformation}

이 레시피에 관련된 질문(재료 대체, 조리 팁, 서빙 아이디어 등)만 대답해.  
다른 주제(요리 외 과학, 역사, 연예 등)는 정중하게 거절하고 레시피 관련 질문으로 유도해.
`.trim();
};