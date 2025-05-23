import { useEffect, useState, useRef, useCallback } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import FloatingActionButtons from '../components/FloatingActionButtons';
import Loading from '../components/Loading';
import PopularTags from '../components/PopularTags';
import { usePagination } from '../components/Hooks/usePagination';

const Home = () => {
    const [searchVal, setSearchVal] = useState('');
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular');
    const [searchTrigger, setSearchTrigger] = useState<true | false>(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const isSearching = searchVal.trim() !== "";
    const endpoint = isSearching ? "/api/search-recipes" : "/api/get-recipes";

    const {
        data: latestRecipes,
        loading,
        popularTags,
        loadMore,
        handleRecipeListUpdate,
        totalRecipes,
        page,
        totalPages
    } = usePagination({
        endpoint,
        sortOption,
        searchQuery: searchVal.trim(),
        searchTrigger,
        resetSearchTrigger: () => setSearchTrigger(false),
    });

    useEffect(() => {
        if (!latestRecipes.length) return;

        const lastRecipeElement = document.querySelector(".recipe-card:last-child");
        if (!lastRecipeElement) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && !loading && page < totalPages) {
                loadMore();
                if (searchVal.trim() && !searchTrigger) {
                    setSearchTrigger(true);
                }
            }
        }, { threshold: 0.5 });

        observerRef.current.observe(lastRecipeElement);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [latestRecipes, loading]);

    const handleSearch = useCallback(() => {
        if (!searchVal.trim()) return;

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = null;
        }

        searchTimeout.current = setTimeout(() => {
            setSearchTrigger(true);
        }, 500);
    }, [searchVal]);

    const sortRecipes = (option: 'recent' | 'popular') => {
        if (sortOption === option || isSearching) return;
        setSortOption(option);
        setSearchTrigger(true);
    };

    const handleTagSearch = async (tag: string) => {
        if (searchVal === tag) {
            setSearchVal(""); // Reset search if clicking the same tag
            return;
        }

        setSearchVal(tag);
        setSearchTrigger(true);
    };

    return (
        <div className="flex flex-col min-h-screen items-center px-4">
            <SearchBar searchVal={searchVal} setSearchVal={setSearchVal} handleSearch={handleSearch} totalRecipes={totalRecipes} />
            <PopularTags tags={popularTags} onTagToggle={handleTagSearch} searchVal={searchVal} />

            {/* 정렬 버튼 */}
            <div className="flex space-x-4 mt-4 mb-4">
                <button
                    onClick={() => sortRecipes('recent')}
                    className={`disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-white flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'recent' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                    disabled={Boolean(searchVal.trim())}
                >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    최신순
                </button>
                <button
                    onClick={() => sortRecipes('popular')}
                    className={`disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-white flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'popular' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg"'
                        }`}
                    disabled={Boolean(searchVal.trim())}
                >
                    <FireIcon className="h-5 w-5 mr-2" />
                    인기순
                </button>
            </div>

            <ViewRecipes recipes={latestRecipes} handleRecipeListUpdate={handleRecipeListUpdate} />
            <FloatingActionButtons />

            {loading && <Loading />}
        </div>
    );
};

export default Home;