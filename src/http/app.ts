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
// import fastifyCors from "@fastify/cors";
import MangaController from "./controller/MangaController";
import {
  MangaGenerateService,
  mangaGenerateServiceFactory,
} from "../core/application/service/MangaGenerate";
import { mapFetchFactory } from "../adapter/service/FetchMapClient";
import { chapterCreationServiceFactory } from "../core/domain/service/MangaCreationService";
import ArticleController from "./controller/ArticleController";
import GameCardController from "./controller/GameCardController";
import {
  GameCardService,
  gameCardServiceFactory,
} from "../core/application/service/GameCardService";
import { mongooseGameCardsRepositoryFactory } from "../adapter/repository/mongoose/CardGameMongooseRepository";
import fastifyCors from "@fastify/cors";

declare module "@fastify/awilix" {
  interface Cradle {
    logger: Logger;
    articleGenerateService: ArticleService;
    mangaGenerateService: MangaGenerateService;
    gameCardService: GameCardService;
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

  if (configuration.server.environment === "production") {
    fastifyApp.register(fastifyCors, {
      origin: "https://nicobar.vercel.app",
    });
  }

  fastifyApp.register(fastifyRequestContext, {
    defaultStoreValues: {
      user: null,
    },
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
  const chapterCreationService = chapterCreationServiceFactory();
  const mangaGenerateService = mangaGenerateServiceFactory(
    mapFetch,
    chapterCreationService
  );

  const gameCardRepository = mongooseGameCardsRepositoryFactory(logger);
  const gameCardService = gameCardServiceFactory(gameCardRepository);

  diContainer.register({
    logger: asValue(logger),
    articleGenerateService: asValue(articleGenerateService),
    mangaGenerateService: asValue(mangaGenerateService),
    gameCardService: asValue(gameCardService),
  });
  fastifyApp.register(MangaController);
  fastifyApp.register(ArticleController);
  fastifyApp.register(GameCardController);
  fastifyApp.register(WelcomeController);

  return fastifyApp;
};

export default app;
