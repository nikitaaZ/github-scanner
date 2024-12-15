import { gql } from "apollo-server";

export const repositoriesTypeDefs = gql`
  type Repository {
    name: String
    owner: String
    size: String
  }

  extend type Query {
    userRepositories(username: String!): [Repository]
  }
`;

export type RepositoryNode = {
  name: string;
  owner: {
    login: string;
  };
  diskUsage: number;
};

export type RepositoriesResponse = {
  user: {
    repositories: {
      nodes: RepositoryNode[];
    };
  };
};
