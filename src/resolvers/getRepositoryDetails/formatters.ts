import { RepositoryDetailsFormatterProps } from "./types";

export const formatRepository = ({
  name,
  owner,
  diskUsage,
  isPrivate,
  webhooks,
  filesCount,
  ymlFile,
}: RepositoryDetailsFormatterProps) => {
  return {
    repoName: name,
    owner: owner.login,
    size: `${diskUsage / 1000} Mb`,
    isPrivate,
    activeWebhooks: webhooks
      .filter(({ active }) => active)
      .map(({ name, url }) => ({
        name,
        url,
      })),
    filesCount,
    ymlFile,
  };
};
