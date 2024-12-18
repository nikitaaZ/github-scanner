import { ApolloError, ApolloServer, gql } from "apollo-server";
import { getRepositories } from "./resolvers/getRepositories/resolver";
import { getRepositoryDetails } from "./resolvers/getRepositoryDetails/resolver";
import { repositoriesTypeDefs } from "./resolvers/getRepositories/types";
import { repositoryDetailsTypeDefs } from "./resolvers/getRepositoryDetails/types";
import { Sema } from "async-sema";
import { withSema } from "./helpers";
import { IncomingMessage } from "http";

export const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
`;

const typeDefs = [
  baseTypeDefs,
  repositoriesTypeDefs,
  repositoryDetailsTypeDefs,
];

const resolvers = {
  Query: {
    getRepositories,
    getRepositoryDetails: withSema(new Sema(2), getRepositoryDetails),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: { req: IncomingMessage }) => ({
    githubToken: req.headers.authorization?.replace("Bearer ", ""),
  }),
  formatError: (err: ApolloError) => {
    const {
      message,
      extensions: { code },
    } = err;
    return { message, code };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
