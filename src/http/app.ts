import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import fastifyRequestContext from "@fastify/request-context";
import fastifySensible from "@fastify/sensible";
import fastify, { FastifyBaseLogger } from "fastify";
import { asValue } from "awilix";
import {
  GenerateArticleService,
  articleGenerateServiceFactory,
} from "../core/application/service/ArticleGenerate";
import { Configuration } from "../core/port/Configuration";
import { Logger } from "..//core/port/Logger";
import InvoicingController from "./controller/ArticleController";
import mongoose from "mongoose";
import { fastifyLogger } from "../adapter/log/FastifyLogger";
import { getLoggerConfigs } from "../adapter/config/PinoFastifyConfiguration";
import { openAiArticleCreationServiceFactory } from "../core/domain/service/OpenAiArticleCreationService";
import { Configuration as OpenAiConfiguration, OpenAIApi } from "openai";
import { openAiServiceFactory } from "../adapter/service/OpenAiService";
import { mongooseArticlesRepositoryFactory } from "../adapter/repository/mongoose/ArticleMongooseRepository";
import WelcomeController from "./controller/WelcomeController";

declare module "@fastify/awilix" {
  interface Cradle {
    logger: Logger;
    articleGenerateService: GenerateArticleService;
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
  fastifyApp.register(fastifyRequestContext, {
    defaultStoreValues: {
      user: null,
    },
  });

  const logger: Logger = fastifyLogger(fastifyApp.log);

  // const bard = new Bard(configuration.secrets.googleBardCookies);
  // const googleBardGateway = googleBardServiceFactory(bard);

  const openAiConfig = new OpenAiConfiguration({
    apiKey: configuration.secrets.openAiKey,
    organization: configuration.secrets.openAiOrganization,
  });
  const openai = new OpenAIApi(openAiConfig);
  const openAiService = openAiServiceFactory(openai);
  const articleCreationService = openAiArticleCreationServiceFactory();
  const articleRepository = mongooseArticlesRepositoryFactory(logger);
  const articleGenerateService = articleGenerateServiceFactory(
    articleCreationService,
    openAiService,
    articleRepository
  );

  diContainer.register({
    logger: asValue(logger),
    articleGenerateService: asValue(articleGenerateService),
  });

  fastifyApp.register(InvoicingController);
  fastifyApp.register(WelcomeController);

  return fastifyApp;
};

export default app;
