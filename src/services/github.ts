import { ApolloError, UserInputError } from "apollo-server";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ERROR_CODES } from "../types";

export const githubService = axios.create({
  baseURL: process.env.GITHUB_API_BASE_URL,
});

githubService.interceptors.request.use(
  config => {
    if (!process.env.GITHUB_API_BASE_URL) {
      console.error("GITHUB_API_BASE_URL is not presented in env file");
      throw new ApolloError("Internal server error", ERROR_CODES.INTERNAL);
    }

    if (!config.headers.Authorization) {
      throw new ApolloError(
        "GitHub token is not presented",
        ERROR_CODES.EMPTY_GITHUB_TOKEN
      );
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

githubService.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      console.error(error?.response?.data || error?.message);
    } else {
      console.error(error);
    }

    throw new ApolloError("Internal server error", ERROR_CODES.INTERNAL);
  }
);

export const setAuthorization = (token: string) => {
  githubService.defaults.headers.Authorization = `Bearer ${token}`;
};
