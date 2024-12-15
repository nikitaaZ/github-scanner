import { checkGithubToken, fetchFromGithub } from "../../helpers";
import { formatRepositories } from "./formatters";
import { Context } from "../../types";

export const getRepositories = async (
  _: unknown,
  { username }: { username: string },
  context: Context
) => {
  const { githubToken } = context;

  checkGithubToken(githubToken);

  const query = `
        query($username: String!) {
          user(login: $username) {
            repositories(first: 20) {
              nodes {
                name
                diskUsage
                owner {
                  login
                }
              }
            }
          }
        }
  `;

  const data = await fetchFromGithub(query, { username }, githubToken);

  return formatRepositories(data.user.repositories.nodes);
};
