export type RepositoryNode = {
  name: string;
  owner: {
    login: string;
  };
  diskUsage: number;
  isPrivate?: boolean;
};

export type Context = {
  githubToken: string;
};

export enum ERROR_CODES {
  INTERNAL = "INTERNAL_SERVER_ERROR",
  EMPTY_GITHUB_TOKEN = "GITHUB_TOKEN_IS_NOT_PRESENTED",
}
