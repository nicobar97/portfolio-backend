import { randomUUID } from "../../../core/utils/Utils";
import {
  ArticlesMongooseModel,
  MongooseArticle,
  MongooseArticleData,
} from "./ArticleMongooseSchema";
import { Article, UnsavedArticle } from "../../../core/domain/model/Article";
import { Either, EitherAsync, Left, Right } from "purify-ts";
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
    EitherAsync.liftEither<Error, MongooseArticleData>(
      Either.encase(() => mapUnsavedArticleToMongooseArticle(unsavedArticle))
    )
      .chain((mongooseArticleData: MongooseArticleData) =>
        EitherAsync<Error, MongooseArticle>(() =>
          ArticlesMongooseModel.create(mongooseArticleData)
        )
      )
      .map((mongooseArticle: MongooseArticle) =>
        mapMongooseArticleToArticle(mongooseArticle)
      )
      .mapLeft(
        (error) =>
          ({
            type: "createArticleError",
            message:
              error.message ||
              `An error occurred while creating article ${JSON.stringify(
                unsavedArticle
              )}.`,
          } as CreateArticleError)
      )
      .run();

const findById =
  (logger: Logger) =>
  (id: string): Promise<Either<FindArticleByIdError, Article>> =>
    EitherAsync<Error, MongooseArticle>(() =>
      ArticlesMongooseModel.findById(id).exec()
    )
      .map((mongooseArticle) => mapMongooseArticleToArticle(mongooseArticle))
      .mapLeft(
        (error) =>
          ({
            type: "findArticleByIdError",
            message:
              error.message || `An error occurred while reading with id ${id}.`,
          } as FindArticleByIdError)
      )
      .run();

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
  type: "article",
  content: mongooseArticle.content,
  title: mongooseArticle.title,
  tags: mongooseArticle.tags,
  estimatedReadingTimeMinutes: mongooseArticle.estimatedReadingTimeMinutes,
  relatedTopicsTags: mongooseArticle.relatedTopicsTags,
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
