import { ApolloServer, gql } from "apollo-server";
import { authContext } from "./helpers";
import { getRepositories } from "./resolvers/getRepositories/resolver";
import { repositoriesTypeDefs } from "./resolvers/getRepositories/types";

export const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
`;

const typeDefs = [baseTypeDefs, repositoriesTypeDefs];

const resolvers = {
  Query: {
    userRepositories: getRepositories,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authContext,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
