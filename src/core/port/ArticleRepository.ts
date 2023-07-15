import { Either } from "purify-ts";
import { UnsavedArticle, Article } from "../domain/model/Article";

export type ArticleRepository = {
  create: CreateArticle;
  findById: FindArticleById;
  findMany: FindManyArticles;
};

export type CreateArticle = (
  article: UnsavedArticle
) => Promise<Either<CreateArticleError, Article>>;

export type CreateArticleError = {
  type: "createArticleError";
  message: string;
};

export type FindArticleById = (
  id: string
) => Promise<Either<FindArticleByIdError, Article>>;

export type FindArticleByIdError = {
  type: "findArticleByIdError";
  message: string;
};

export type FindManyArticles = () => Promise<
  Either<FindManyArticlesError, Article[]>
>;

export type FindManyArticlesError = {
  type: "findManyArticlesError";
  message: string;
};
