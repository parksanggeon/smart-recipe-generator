import axios from "axios";
import { getSession } from 'next-auth/react';
import { ExtendedRecipe, PaginationQueryType } from "../types";
import { GetServerSidePropsContext } from "next";
import React from "react";

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
    likedBy: recipe.likedBy?.map(
      (l: { _id: string; name: string; image: string }) => ({
        _id: l._id,
        name: l.name,
        image: l.image,
      })
    ) ?? [],
    owns: recipe.owner?._id?.toString() === userId,
    liked: recipe.likedBy?.some(
      (l: { _id: string }) => l._id?.toString() === userId
    ) ?? false,
  }));
};

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

type Method = 'get' | 'post' | 'put' | 'delete';

interface RESTcallTypes {
  address: string;
  method?: Method;
  payload?: { [key: string]: any };
}

export const call_api = async ({ address, method = 'post', payload = {} }: RESTcallTypes) => {
  try {
    const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };
    const url = `${baseURL}${address.startsWith('/') ? address : `/${address}`}`;
    const response =
      method === 'get' || method === 'delete'
        ? await axios[method](url, { ...config, params: payload })
        : await axios[method](url, payload, config);
    console.log(`✅ call_api response from ${url}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ REST call (${method}) to ${address} failed:`, error.response?.data || error.message);
    throw error.response?.data || { error: error.message };
  }
};

export const formatDate = (date: string) => {
  const [, day, mth, year] = new Date(date).toUTCString().split(' ');
  return `${day} ${mth} ${year}`;
};

export const playAudio = async (
  audioUrl: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  onEnd?: () => void
): Promise<void> => {
  try {
    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onended = () => { if (onEnd) onEnd(); };
    audio.load();
    await new Promise<void>((resolve, reject) => {
      let isResolved = false;
      audio.oncanplaythrough = () => { if (!isResolved) { isResolved = true; resolve(); } };
      audio.onerror = () => { if (!isResolved) { isResolved = true; reject(new Error('Error loading audio')); } };
      setTimeout(() => { if (!isResolved) { isResolved = true; reject(new Error('Audio loading timeout')); } }, 20000);
    });
    await audio.play();
  } catch (error: any) {
    console.error(`playAudio: Error playing audio: ${error.message}`);
    throw error;
  }
};

export const paginationQueryHelper = (queryObj: PaginationQueryType) => {
  const page = Number(queryObj.page) || 1;
  const limit = Number(queryObj.limit) || 12;
  const skip = (page - 1) * limit;
  const sortOption = typeof queryObj.sortOption === 'string' ? queryObj.sortOption : 'popular';
  const query = typeof queryObj.query === 'string' ? queryObj.query : undefined;
  return { page, limit, skip, sortOption, query };
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const fetchIngredients = async () => {
  try {
    const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    console.log("✅ fetchIngredients baseURL:", baseURL);
    if (!baseURL) {
      throw new Error("baseURL이 정의되지 않았습니다.");
    }
    const response = await axios.get(`${baseURL}/api/get-ingredients`);
    return response.data;
  } catch (error) {
    console.error("❌ fetchIngredients error:", error);
    return [];
  }
};
