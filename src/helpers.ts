import { Sema } from "async-sema";
import { Context } from "./types";
import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";

export const withSema =
  <ParentType = unknown, ArgsType = Record<string, any>, ReturnType = unknown>(
    fetchSemaphore: Sema,
    resolver: GraphQLFieldResolver<ParentType, Context, ArgsType>
  ) =>
  async (
    parent: ParentType,
    variables: ArgsType,
    context: Context,
    info: GraphQLResolveInfo
  ): Promise<ReturnType> => {
    await fetchSemaphore.acquire();

    try {
      return (await resolver(parent, variables, context, info)) as ReturnType;
    } finally {
      fetchSemaphore.release();
    }
  };
