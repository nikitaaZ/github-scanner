import { RepositoryNode } from "../../types";

export const formatRepositories = (repos: RepositoryNode[]) => {
  return repos.map(({ name, owner, diskUsage }) => ({
    name,
    owner: owner.login,
    size: `${diskUsage / 1000} Mb`,
  }));
};
