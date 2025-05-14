import axios from "axios";
import { getSession } from 'next-auth/react';
import { ExtendedRecipe, PaginationQueryType } from "../types";
import { GetServerSidePropsContext } from "next";
import React from "react";

// 레시피에 사용자 관련 정보 추가 (소유 여부, 좋아요 여부)
export const filterResults = (recipes: ExtendedRecipe[], userId: string) => {
  return recipes.map((recipe) => ({
    ...recipe,
    owner: recipe.owner
      ? {
          _id: recipe.owner._id,
          name: recipe.owner.name,
          image: recipe.owner.image,
        }
      : null,
    likedBy: recipe.likedBy?.map(({ _id, name, image }) => ({ _id, name, image })) ?? [],
    owns: recipe.owner?._id?.toString() === userId,
    liked: recipe.likedBy?.some(l => l._id?.toString() === userId) ?? false,
  }));
};

// 레시피 리스트 업데이트 (수정 또는 삭제 반영)
export const updateRecipeList = (
  oldList: ExtendedRecipe[],
  newRecipe: ExtendedRecipe | null,
  deleteId?: string
) => {
  if (!newRecipe && !deleteId) return oldList;
  const id = newRecipe ? newRecipe._id : deleteId;
  return newRecipe
    ? oldList.map(recipe => (recipe._id === id ? newRecipe : recipe))
    : oldList.filter(recipe => recipe._id !== id);
};

// 서버사이드 렌더링용 데이터 요청 + 인증 체크
export const getServerSidePropsUtility = async (
  context: GetServerSidePropsContext,
  address: string,
  propskey: string = 'recipes'
) => {
  try {
    const session = await getSession(context);
    if (!session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${address}`, {
      headers: {
        Cookie: context.req.headers.cookie || '',
      },
    });
    return {
      props: {
        [propskey]: data,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch ${propskey}:`, error);
    return {
      props: {
        [propskey]: [],
      },
    };
  }
};

// REST API 호출 유틸 (get, post, put, delete)
type Method = 'get' | 'post' | 'put' | 'delete';

interface RESTcallTypes {
  address: string;
  method?: Method;
  payload?: { [key: string]: any };
}

export const call_api = async ({ address, method = 'get', payload }: RESTcallTypes) => {
  try {
    const { data } = await axios[method](address, payload);
    return data;
  } catch (error) {
    console.error(`REST call (${method}) to ${address} failed:`, error);
    throw error;
  }
};

// 날짜 포맷 (예: 14 May 2025)
export const formatDate = (date: string) => {
  const [, day, mth, year] = new Date(date).toUTCString().split(' ');
  return `${day} ${mth} ${year}`;
};

// 오디오 재생 함수
export const playAudio = async (
  audioUrl: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  onEnd?: () => void
): Promise<void> => {
  try {
    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.load();

    await new Promise<void>((resolve, reject) => {
      let isResolved = false;

      audio.oncanplaythrough = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };

      audio.onerror = () => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('Error loading audio'));
        }
      };

      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('Audio loading timeout'));
        }
      }, 20000); // 20초 타임아웃
    });

    await audio.play();
  } catch (error: any) {
    console.error(`playAudio: Error playing audio: ${error.message}`);
    throw error;
  }
};

// 페이지네이션 파라미터 계산
export const paginationQueryHelper = (queryObj: PaginationQueryType) => {
  const page = Number(queryObj.page) || 1;
  const limit = Number(queryObj.limit) || 12;
  const skip = (page - 1) * limit;
  const sortOption = typeof queryObj.sortOption === 'string' ? queryObj.sortOption : 'popular';
  const query = typeof queryObj.query === 'string' ? queryObj.query : undefined;

  return { page, limit, skip, sortOption, query };
};

// 환경변수 기반 기본 URL
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// 재사용 가능한 재료 호출 함수 (선택)
export const fetchIngredients = async () => {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await axios.get(`${baseURL}/api/get-ingredients`);
    return response.data;
  } catch (error) {
    console.error("fetchIngredients error:", error);
    return [];
  }
};

