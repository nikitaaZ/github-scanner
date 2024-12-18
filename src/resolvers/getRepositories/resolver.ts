import { formatRepositories } from "./formatters";
import { Context, RepositoryNode } from "../../types";
import { githubService, setAuthorization } from "../../services/github";
import { RepositoriesResponse } from "./types";

export const getRepositories = async (
  _: unknown,
  { username }: { username: string },
  context: Context
) => {
  try {
    const { githubToken } = context;
    setAuthorization(githubToken);

    const query = `
      query($username: String!, $after: String) {
        user(login: $username) {
          repositories(first: 100, after: $after) {
            nodes {
              name
              diskUsage
              owner {
                login
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    let allRepositories = [] as RepositoryNode[];
    let hasNextPage = true;
    let after = "";

    while (hasNextPage) {
      const response = await githubService.post<RepositoriesResponse>(
        "/graphql",
        {
          query,
          variables: { username, after },
        }
      );

      const { nodes, pageInfo } = response.data.data.user.repositories;

      allRepositories = allRepositories.concat(nodes);

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    }

    return formatRepositories(allRepositories);
  } catch (error) {
    return Promise.reject(error);
  }
};
