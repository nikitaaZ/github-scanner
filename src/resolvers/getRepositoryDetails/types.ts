import { gql } from "apollo-server";
import { RepositoryNode } from "../../types";

export const repositoryDetailsTypeDefs = gql`
  type RepositoryDetails {
    repoName: String
    size: String
    owner: String
    isPrivate: Boolean
    filesCount: Int
    ymlFile: YamlFile
    activeWebhooks: [Webhook]
  }

  type YamlFile {
    name: String
    content: String
  }

  type Webhook {
    name: String
    url: String
  }

  extend type Query {
    getRepositoryDetails(username: String!, name: String!): RepositoryDetails
  }
`;

export type RepositoriesResponse = {
  user: {
    repository: RepositoryNode;
  };
};
export type Webhook = {
  active: boolean;
  name: string;
  url: string;
};

export type YmlFile = { name: string; content: string };

export type RepositoryDetailsFormatterProps = RepositoryNode & {
  webhooks: Webhook[];
  ymlFile: YmlFile;
  filesCount: number;
};

export type FileTreeItem = {
  type: string;
  path: string;
  url: string;
};

export type FilesTreeResponse = {
  tree: FileTreeItem[];
  truncated: boolean;
};

export type FileContentResponse = {
  content: string;
  encoding: BufferEncoding;
};
