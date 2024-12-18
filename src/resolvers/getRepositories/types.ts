import { gql } from "apollo-server";
import { RepositoryNode } from "../../types";

export const repositoriesTypeDefs = gql`
  type Repository {
    name: String
    owner: String
    size: String
  }

  extend type Query {
    getRepositories(username: String!): [Repository]
  }
`;

export type RepositoriesResponse = {
  data: {
    user: {
      repositories: {
        nodes: RepositoryNode[];
        pageInfo: PageInfo;
      };
    };
  };
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string;
};
