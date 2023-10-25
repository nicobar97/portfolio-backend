import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify/types/plugin";

import { EitherAsync } from "purify-ts";

import { Logger } from "../../core/port/Logger";
import {
  GetAllTrainError,
  TrainTablesGateway,
} from "../../adapter/gateway/TrainTablesGateway";
import { TrainTable } from "../../core/domain/model/Train";

const TrainTableController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  const handler: TrainTablesGateway =
    fastify.diContainer.resolve("trainTableGateway");
  const logger: Logger = fastify.diContainer.resolve("logger");
  fastify.get(
    "/departures/:placeId",
    {
      preValidation: [],
    },
    async (
      request: FastifyRequest<{
        Params: {
          placeId: string;
        };
      }>,
      reply
    ) =>
      EitherAsync.fromPromise<GetAllTrainError, TrainTable>(() =>
        handler.getAllTrainFromPlaceId(request.params.placeId)
      )
        .map((trainTable: TrainTable) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(trainTable);
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
  app.register(TrainTableController, {
    prefix: "/api/traintable",
  })
);
