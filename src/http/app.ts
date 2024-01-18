import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import fastifyRequestContext from "@fastify/request-context";
import fastifySensible from "@fastify/sensible";
import fastify, { FastifyBaseLogger } from "fastify";
import { asValue } from "awilix";
import {
  ArticleService,
  articleServiceFactory,
} from "../core/application/service/ArticleGenerate";
import { Configuration } from "../core/port/Configuration";
import { Logger } from "..//core/port/Logger";
import mongoose from "mongoose";
import { fastifyLogger } from "../adapter/log/FastifyLogger";
import { getLoggerConfigs } from "../adapter/config/PinoFastifyConfiguration";
import { openAiArticleCreationServiceFactory } from "../core/domain/service/OpenAiArticleCreationService";
import { Configuration as OpenAiConfiguration, OpenAIApi } from "openai";
import { openAiServiceFactory } from "../adapter/service/OpenAiService";
import { mongooseArticlesRepositoryFactory } from "../adapter/repository/mongoose/ArticleMongooseRepository";
import WelcomeController from "./controller/WelcomeController";
import fastifyCors from "@fastify/cors";
import {
  TrainTablesGateway,
  trainTableGatewayFactory,
} from "../adapter/gateway/TrainTablesGateway";
import TrainTableController from "./controller/TrainTableController";
import { mapFetchFactory } from "../adapter/service/FetchMapClient";
import ArticleController from "./controller/ArticleController";

declare module "@fastify/awilix" {
  interface Cradle {
    logger: Logger;
    articleGenerateService: ArticleService;
    trainTableGateway: TrainTablesGateway;
  }
}

const app = async (configuration: Configuration) => {
  mongoose.connect(configuration.database.connectionString);

  const fastifyApp = fastify({
    logger: getLoggerConfigs(configuration),
  });

  fastifyApp.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
  });
  fastifyApp.register(fastifySensible);

  fastifyApp.register(fastifyCors, {
    origin: "https://nicobar.vercel.app",
  });

  const logger: Logger = fastifyLogger(fastifyApp.log);

  const openAiConfig = new OpenAiConfiguration({
    apiKey: configuration.secrets.openAiKey,
    organization: configuration.secrets.openAiOrganization,
  });
  const openai = new OpenAIApi(openAiConfig);
  const openAiService = openAiServiceFactory(openai);
  const articleCreationService = openAiArticleCreationServiceFactory();
  const articleRepository = mongooseArticlesRepositoryFactory(logger);
  const articleGenerateService = articleServiceFactory(
    articleCreationService,
    openAiService,
    articleRepository
  );

  const mapFetch = mapFetchFactory();

  const trainTableGateway: TrainTablesGateway =
    trainTableGatewayFactory(mapFetch);

  diContainer.register({
    logger: asValue(logger),
    articleGenerateService: asValue(articleGenerateService),
    trainTableGateway: asValue(trainTableGateway),
  });

  fastifyApp.register(ArticleController);
  fastifyApp.register(WelcomeController);
  fastifyApp.register(TrainTableController);

  return fastifyApp;
};

export default app;
