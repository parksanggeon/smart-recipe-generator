import { useEffect, useState } from 'react';

const generationMessages = [
    '🔪 신선한 재료를 썰고 있어요...',
    '🥘 전문가처럼 냄비를 저어요...',
    '🍳 완벽한 온도로 팬을 달구고 있어요...',
    '🧂 마법 같은 소금 한 꼬집을 더해요...',
    '🍅 토마토를 넣고 있어요—튀지 않게 조심하세요!',
    '🔥 완벽한 시어링을 위해 불을 올려요...',
    '🧁 창의력과 맛을 살짝 뿌려요...',
    '🍽️ 미슐랭 셰프처럼 플레이팅 중이에요...',
    '🥄 맛을 테스트 중이에요... 약간 더 감칠맛이 필요해요!',
    '🧑‍🍳 전문가처럼 간을 조절하고 있어요...',
    '🥖 신선한 빵을 찢어 곁들여요...',
    '🍋 균형을 맞추기 위해 레몬즙을 조금 짜요...',
    '🍷 팬에 와인을 넣어 맛을 더해요...',
    '🌀 맛을 하나로 잘 섞고 있어요...',
    '💡 새로운 레시피 아이디어가 떠올랐어요!',
    '🌿 신선한 허브로 고명을 올려요...',
    '⏳ 맛이 우러나도록 천천히 끓이고 있어요...',
    '🎨 플레이팅을 완성해요—음식도 예술이니까요!',
    '📸 서빙 전에 사진을 찍어요—이 요리는 정말 예뻐요!',
    '🥢 마지막 준비를 위해 하나하나 정리 중이에요...',
];

const savingMessages = [
    '🖼️ 레시피에 어울리는 멋진 이미지를 만들고 있어요...',
    '🚀 AI에서 완벽한 이미지를 불러오고 있어요...',
    '📤 레시피 이미지를 클라우드에 업로드 중이에요...',
    '☁️ 이미지를 안전하게 서버에 저장하고 있어요...',
    '📝 레시피 정보를 준비하고 있어요...',
    '💾 레시피를 내 요리책에 저장하고 있어요...',
    '📑 모든 것을 마무리하며 완벽하게 정리 중이에요...',
];

const finalGenerationMessage = '🍳 레시피 마무리 중이에요... 잠시만 기다려주세요!';
const finalSavingMessage = '🔄 모든 것을 합치고 있어요... 이미지 불러오기, 저장, 완벽하게 만들기!';

const Loading = ({
    isComplete = false,
    isProgressBar = false,
    loadingType = 'generation', // 기본값은 레시피 생성
}: {
    isComplete?: boolean;
    isProgressBar?: boolean;
    loadingType?: 'generation' | 'saving';
}) => {
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(
        loadingType === 'saving' ? savingMessages[0] : generationMessages[0]
    );

    useEffect(() => {
        if (!isProgressBar) return;

        if (isComplete) {
            setProgress(100);
            setCurrentMessage('✅ 레시피가 완성되었어요!');
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    setCurrentMessage(loadingType === 'saving' ? finalSavingMessage : finalGenerationMessage);
                    return prev;
                }

                const newProgress = prev + Math.floor(Math.random() * 4) + 2;

                if (newProgress < 90) {
                    const messages = loadingType === 'saving' ? savingMessages : generationMessages;
                    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
                } else if (newProgress >= 90) {
                    setCurrentMessage(loadingType === 'saving' ? finalSavingMessage : finalGenerationMessage);
                }

                return Math.min(newProgress, 90);
            });
        }, 1000); // 1초마다 업데이트

        return () => clearInterval(interval);
    }, [isComplete, isProgressBar, loadingType]);

    // 🚀 반응형 진행 바
    if (isProgressBar) {
        return (
            <div className="flex flex-col items-center justify-center mt-5 px-4 w-full">
                <div className="w-full max-w-lg sm:max-w-md bg-gray-300 rounded-full h-6 shadow-lg relative overflow-hidden">
                    <div
                        className="h-6 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-md animate-pulse"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{
                            width: `${progress}%`,
                            transition: 'width 0.5s ease-in-out',
                        }}
                    />
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-800 animate-pulse text-center px-2">
                    {currentMessage}
                </p>
                <p className="mt-1 text-sm text-gray-500">{progress}% 완료</p>
            </div>
        );
    }

    // 기본 스피너
    return (
        <div className="flex items-center justify-center mt-5">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
            </div>
        </div>
    );
};

export default Loading;
