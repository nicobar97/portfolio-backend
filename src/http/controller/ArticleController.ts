import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify/types/plugin";
import {
  GenerateArticleError,
  GenerateArticleService,
  GetArticlesError,
} from "../../core/application/service/ArticleGenerate";
import { Logger } from "../../core/port/Logger";
import {
  Article,
  ArticlePrompt,
  UnsavedArticle,
} from "../../../src/core/domain/model/Article";
import { EitherAsync } from "purify-ts";

interface ArticleGenerateRequest extends FastifyRequest {
  Body: ArticlePrompt;
}

const InvoicingController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  const handler: GenerateArticleService = fastify.diContainer.resolve(
    "articleGenerateService"
  );
  const logger: Logger = fastify.diContainer.resolve("logger");

  fastify.get(
    "/get",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GetArticlesError, Article[]>(() =>
        handler.getManyArticles()
      )
        .map((articles: Article[]) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(articles);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(500).send(error);
        })
  );

  fastify.post<ArticleGenerateRequest>(
    "/generate",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GenerateArticleError, Article>(() =>
        handler.generateArticle(request.body)
      )
        .map((article: Article) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(article);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(500).send(error);
        })
  );

  fastify.post<ArticleGenerateRequest>(
    "/unsave",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GenerateArticleError, UnsavedArticle>(() =>
        handler.generateUnsavedArticle(request.body)
      )
        .map((unsavedArticle: UnsavedArticle) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(unsavedArticle);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(500).send(error);
        })
  );

  fastify.get("/hello", async (request, reply) => {
    reply.code(201).send(`Hello from ip ${request.ip}`);
  });
};

export default fp(async (app, _opts) =>
  app.register(InvoicingController, {
    prefix: "/api/article",
  })
);
