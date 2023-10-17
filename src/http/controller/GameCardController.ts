import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify/types/plugin";

import { EitherAsync } from "purify-ts";
import {
  GameCardService,
  GetGameCardsError,
  GetGameCardError,
} from "../../core/application/service/GameCardService";
import { GameCard } from "../../core/domain/model/GameCard";
import { Logger } from "../../core/port/Logger";

const GameCardController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  const handler: GameCardService =
    fastify.diContainer.resolve("gameCardService");
  const logger: Logger = fastify.diContainer.resolve("logger");

  fastify.get(
    "/all",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GetGameCardsError, GameCard[]>(() =>
        handler.getManyGameCards()
      )
        .map((gameCards: GameCard[]) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(gameCards);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(500).send(error);
        })
  );

  fastify.get(
    "/get/:gameCardId",
    {
      preValidation: [],
    },
    async (
      request: FastifyRequest<{
        Params: {
          gameCardId: string;
        };
      }>,
      reply
    ) =>
      EitherAsync.fromPromise<GetGameCardError, GameCard>(() =>
        handler.getGameCard(request.params.gameCardId)
      )
        .map((gameCards: GameCard) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(gameCards);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(400).send(error);
        })
  );
};

export default fp(async (app, _opts) =>
  app.register(GameCardController, {
    prefix: "/api/gamecards/op",
  })
);
