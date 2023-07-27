import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify/types/plugin";
import {
  GenerateArticleError,
  ArticleService,
  GetArticlesError,
  GetArticleError,
} from "../../core/application/service/ArticleGenerate";
import { Logger } from "../../core/port/Logger";
import {
  Article,
  ArticlePrompt,
  SimpleArticle,
  UnsavedArticle,
} from "../../core/domain/model/Article";
import { EitherAsync } from "purify-ts";

interface ArticleGenerateRequest extends FastifyRequest {
  Body: ArticlePrompt;
}

const ArticleController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  const handler: ArticleService = fastify.diContainer.resolve(
    "articleGenerateService"
  );
  const logger: Logger = fastify.diContainer.resolve("logger");

  fastify.get(
    "/simples",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GetArticlesError, SimpleArticle[]>(() =>
        handler.getManyArticles()
      )
        .map((articles: SimpleArticle[]) => {
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

  fastify.get(
    "/get/:articleId",
    {
      preValidation: [],
    },
    async (
      request: FastifyRequest<{
        Params: {
          articleId: string;
        };
      }>,
      reply
    ) =>
      EitherAsync.fromPromise<GetArticleError, Article>(() =>
        handler.getArticle(request.params.articleId)
      )
        .map((articles: Article) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(articles);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(400).send(error);
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
          reply.code(400).send(error);
        })
  );
};

export default fp(async (app, _opts) =>
  app.register(ArticleController, {
    prefix: "/api/articles",
  })
);
