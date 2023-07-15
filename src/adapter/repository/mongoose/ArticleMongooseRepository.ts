import { randomUUID } from "../../../core/utils/Utils";
import {
  ArticlesMongooseModel,
  MongooseArticle,
  MongooseArticleData,
} from "./ArticleMongooseSchema";
import { Article, UnsavedArticle } from "../../../core/domain/model/Article";
import { Either, Left, Right } from "purify-ts";
import {
  FindArticleByIdError,
  FindArticleById,
  ArticleRepository,
  FindManyArticles,
  FindManyArticlesError,
  CreateArticleError,
  CreateArticle,
} from "../../../core/port/ArticleRepository";
import { Logger } from "../../../core/port/Logger";

export const mongooseArticlesRepositoryFactory = (
  logger: Logger
): ArticleRepository => ({
  create: create(logger),
  findById: findById(logger),
  findMany: findMany(logger),
});

const create =
  (logger: Logger): CreateArticle =>
  (
    unsavedArticle: UnsavedArticle
  ): Promise<Either<CreateArticleError, Article>> =>
    ArticlesMongooseModel.create(
      mapUnsavedArticleToMongooseArticle(unsavedArticle)
    )
      .then((article) =>
        Right(article).map((article) => mapMongooseArticleToArticle(article))
      )
      .catch(
        (error: Error): Either<CreateArticleError, Article> =>
          Left({
            type: "createArticleError",
            message:
              error.message ||
              `An error occurred while creating article ${JSON.stringify(
                unsavedArticle
              )}.`,
          })
      );

const findById =
  (logger: Logger) =>
  (id: string): Promise<Either<FindArticleByIdError, Article>> =>
    ArticlesMongooseModel.findById(id)
      .exec()
      .then(
        (
          mongooseArticle: MongooseArticle | null
        ): Either<FindArticleByIdError, Article> =>
          mongooseArticle === null
            ? Left({
                type: "findArticleByIdError",
                message: `Article with id ${id} not found.`,
              })
            : Right(mongooseArticle).map((article) =>
                mapMongooseArticleToArticle(article)
              )
      )
      .catch(
        (error: Error): Either<FindArticleByIdError, Article> =>
          Left({
            type: "findArticleByIdError",
            message:
              error.message || `An error occurred while reading with id ${id}.`,
          })
      );

const findMany =
  (logger: Logger) => (): Promise<Either<FindManyArticlesError, Article[]>> =>
    ArticlesMongooseModel.find()
      .exec()
      .then(
        (
          mongooseArticle: MongooseArticle[] | null
        ): Either<FindManyArticlesError, Article[]> =>
          mongooseArticle.length === 0
            ? Left({
                type: "findManyArticlesError",
                message: `Articles not found.`,
              })
            : Right(mongooseArticle).map((articles) =>
                mapManyMongooseArticlesToArticles(articles)
              )
      )
      .catch(
        (error: Error): Either<FindManyArticlesError, Article[]> =>
          Left({
            type: "findManyArticlesError",
            message:
              error.message || `An error occurred while reading articles.`,
          })
      );

const mapMongooseArticleToArticle = (
  mongooseArticle: MongooseArticle
): Article => ({
  content: mongooseArticle.content,
  title: mongooseArticle.title,
  tags: mongooseArticle.tags,
  estimatedReadingTimeMinutes: mongooseArticle.estimatedReadingTimeMinutes,
  relatedTopicsTags: mongooseArticle.relatedTopicsTags,
  formatted_content: mongooseArticle.formatted_content,
  date: mongooseArticle.date,
  articlePrompt: {
    task: mongooseArticle.articlePrompt.task,
    tone: mongooseArticle.articlePrompt.tone,
    topic: mongooseArticle.articlePrompt.topic,
    audience: mongooseArticle.articlePrompt.audience,
    style: mongooseArticle.articlePrompt.style,
    length: mongooseArticle.articlePrompt.length,
  },
  id: mongooseArticle._id,
});

const mapUnsavedArticleToMongooseArticle = (
  mongooseArticle: UnsavedArticle
): MongooseArticleData => ({
  ...mongooseArticle,
  articlePrompt: {
    task: mongooseArticle.articlePrompt.task,
    tone: mongooseArticle.articlePrompt.tone,
    topic: mongooseArticle.articlePrompt.topic,
    audience: mongooseArticle.articlePrompt.audience,
    style: mongooseArticle.articlePrompt.style,
    length: mongooseArticle.articlePrompt.length,
  },
  _id: randomUUID(),
});

const mapManyMongooseArticlesToArticles = (
  mongooseArticles: MongooseArticle[]
) =>
  mongooseArticles.map(
    (mongooseArticle: MongooseArticle): Article =>
      mapMongooseArticleToArticle(mongooseArticle)
  );
