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
  RawArticle,
  SimpleArticle,
  UnsavedArticle,
} from "../../core/domain/model/Article";
import { EitherAsync } from "purify-ts";
import { FetchMapError } from "../../core/domain/model/errors";
import {
  GenerateChapterError,
  GenerateChapterListError,
  GenerateMangaListError,
  MangaGenerateService,
} from "../../core/application/service/MangaGenerate";
import { CreateChapterError } from "../../core/domain/service/MangaCreationService";
import {
  Chapter,
  ChapterList,
  MangaList,
  SupportedProvider,
} from "../../core/domain/model/Manga";

interface MangaGenerateRequest extends FastifyRequest {
  Body: MangaRequestBody;
}

interface MangaChapterListRequest extends FastifyRequest {
  Body: MangaRequestBody;
}

interface MangaListRequest extends FastifyRequest {
  Body: MangaListRequestBody;
}

type MangaRequestBody = {
  url: string;
  provider: SupportedProvider;
};

type MangaListRequestBody = {
  provider: SupportedProvider;
};

const MangaController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  const handler: MangaGenerateService = fastify.diContainer.resolve(
    "mangaGenerateService"
  );
  const logger: Logger = fastify.diContainer.resolve("logger");

  fastify.post<MangaGenerateRequest>(
    "/read",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GenerateChapterError, Chapter>(() =>
        handler.generateChapter(request.body.url, request.body.provider)
      )
        .map((chapter: Chapter) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(chapter);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(400).send(error);
        })
  );

  fastify.post<MangaChapterListRequest>(
    "/chapter/list",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GenerateChapterListError, ChapterList>(() =>
        handler.generateChapterList(request.body.url, request.body.provider)
      )
        .map((chapter: ChapterList) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(chapter);
        })
        .mapLeft((error) => {
          logger.error(
            `[ERROR] Error on request: ${JSON.stringify(request.body)}`
          );
          reply.code(400).send(error);
        })
  );

  fastify.post<MangaListRequest>(
    "/list",
    {
      preValidation: [],
    },
    async (request, reply) =>
      EitherAsync.fromPromise<GenerateMangaListError, MangaList>(() =>
        handler.generateMangaList(request.body.provider)
      )
        .map((mangaList: MangaList) => {
          logger.debug(
            `[DEBUG] Processed request: ${JSON.stringify(request.body)}`
          );
          reply.code(200).send(mangaList);
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
  app.register(MangaController, {
    prefix: "/api/manga",
  })
);
