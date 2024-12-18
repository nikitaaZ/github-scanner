import { formatRepository } from "./formatters";
import { Context } from "../../types";
import { githubService, setAuthorization } from "../../services/github";
import { FileContentResponse, FilesTreeResponse, YmlFile } from "./types";

// Implementation context:
// There is possibility to grab files data via graphql query, BUT as far as I understood
// query method has nesting limitation which is not good got generic solution.
// Because of that reason I decided to fetch this data using REST endpoint with recursive=1 flag.
// This method will work for most cases, but it also has own limitations (100.000 entries or 7 MB response ).
// So I decided to add recursive fallback method which should cover these large edge cases.
// Note: REST endpoint was also used for webhooks because I didn't found any mentions of such data in graphql API docs.

const GITHUB_URL = process.env.GITHUB_API_BASE_URL || "";

const fetchFileContent = async (link: string) => {
  const {
    data: { content, encoding },
  } = await githubService.get<FileContentResponse>(link);

  return Buffer.from(content, encoding).toString("utf-8");
};

const countRecursively = async (initialLink: string, ymlFile: YmlFile) => {
  const {
    data: { tree: filesTree },
  } = await githubService.get<FilesTreeResponse>(initialLink);
  let counter = 0;

  let folders = [];

  for (const item of filesTree) {
    if (item.type === "blob") {
      counter++;

      if (item.path.endsWith(".yml") && !ymlFile.content) {
        const content = await fetchFileContent(
          item.url.replace(GITHUB_URL, "")
        );

        ymlFile.name = item.path;
        ymlFile.content = content;
      }
    } else if (item.type === "tree") {
      const link = item.url.replace(GITHUB_URL, "");

      folders.push(countRecursively(link, ymlFile));
    }
  }

  const foldersResults = await Promise.all(folders);
  counter += foldersResults.reduce((acc, result) => acc + result, 0);

  return counter;
};

export const getRepositoryDetails = async (
  _: unknown,
  { username, name }: { username: string; name: string },
  context: Context
) => {
  try {
    const { githubToken } = context;
    setAuthorization(githubToken);

    let filesCount = 0;
    let ymlFile = {} as YmlFile;

    const query = `
        query($username: String!, $name: String!) {
          repository(owner: $username, name: $name) {
            defaultBranchRef{
              name
            }
            name
            diskUsage
            owner {
              login
            }
            isPrivate
          }
        }
  `;

    const {
      data: {
        data: { repository },
      },
    } = await githubService.post("/graphql", {
      query,
      variables: { username, name },
    });

    const { data: webhooks } = await githubService.get(
      `/repos/${username}/${name}/hooks`
    );

    const {
      data: { tree: filesTree, truncated },
    } = await githubService.get<FilesTreeResponse>(
      `/repos/${username}/${name}/git/trees/${repository.defaultBranchRef.name}?recursive=1`
    );

    if (!truncated) {
      for (const item of filesTree) {
        if (item.type === "blob") {
          filesCount++;

          if (item.path.endsWith(".yml") && !ymlFile.content) {
            const content = await fetchFileContent(
              item.url.replace(GITHUB_URL, "")
            );

            ymlFile = { name: item.path, content: content };
          }
        }
      }
    } else {
      const counter = await countRecursively(
        `/repos/${username}/${name}/git/trees/${repository.defaultBranchRef.name}`,
        ymlFile
      );

      filesCount = counter;
    }

    return formatRepository({
      ...repository,
      webhooks,
      filesCount,
      ymlFile,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};
