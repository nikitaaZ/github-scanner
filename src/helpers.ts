import axios, { AxiosError } from "axios";
import { RepositoriesResponse } from "./resolvers/getRepositories/types";
import { IncomingMessage } from "http";

export const checkGithubToken = (token?: string) => {
  if (!token) {
    throw new Error("GitHub token is required");
  }
};

export const authContext = ({ req }: { req: IncomingMessage }) => {
  const githubToken = req.headers.authorization?.replace("Bearer ", "");
  return { githubToken };
};

export const fetchFromGithub = async (
  query: string,
  variables: any,
  githubToken: string
) => {
  if (!process.env.GITHUB_API) {
    throw new Error("Github API link is not defined");
  }

  try {
    const response = await axios.post<{ data: RepositoriesResponse }>(
      process.env.GITHUB_API,
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(error?.response?.data || error?.message);
      throw new Error("Failed to fetch data from GitHub");
    } else {
      console.error(error);
      throw new Error("Unexpected error appeared");
    }
  }
};
