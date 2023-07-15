import { Either, EitherAsync } from "purify-ts";
import {
  Article,
  ArticlePrompt,
  RawArticle,
  SimpleArticle,
  UnsavedArticle,
} from "../../../core/domain/model/Article";
import {
  AiServiceError,
  AskAiService,
  GenerativeAiService,
} from "../../../core/port/GenerativeAiService";
import {
  ArticleCreationService,
  CreateRawArticleError,
  CreateUnsavedArticleError,
} from "../../domain/service/BardArticleCreationService";
import {
  ArticleRepository,
  CreateArticleError,
  FindArticleByIdError,
  FindManyArticlesError,
} from "../../port/ArticleRepository";

export type Reponse = { content: string };

export type GenerateArticleError =
  | AiServiceError
  | CreateRawArticleError
  | CreateUnsavedArticleError
  | CreateArticleError;

export type GetArticlesError = FindManyArticlesError;
export type GetArticleError = FindArticleByIdError;

export type GenerateUnsavedArticle = (
  prompt: ArticlePrompt
) => Promise<Either<GenerateArticleError, UnsavedArticle>>;

export type GenerateArticle = (
  prompt: ArticlePrompt
) => Promise<Either<GenerateArticleError, Article>>;

export type GetManysArticles = () => Promise<
  Either<GetArticlesError, SimpleArticle[]>
>;

export type GetArticle = (id: string) => Promise<Either<GetArticleError, Article>>;

export type ArticleService = {
  generateUnsavedArticle: GenerateUnsavedArticle;
  generateArticle: GenerateArticle;
  getManyArticles: GetManysArticles;
  getArticle: GetArticle;
};

export const articleServiceFactory = (
  articleCreationService: ArticleCreationService,
  articleGeneratingAiService: GenerativeAiService,
  articleRepository: ArticleRepository
): ArticleService => ({
  generateUnsavedArticle: generateUnsavedArticle(
    articleCreationService,
    articleGeneratingAiService
  ),
  generateArticle: generateArticle(
    articleCreationService,
    articleGeneratingAiService,
    articleRepository
  ),
  getManyArticles: getManyArticles(articleRepository),
  getArticle: getArticle(articleRepository),
});

const generateUnsavedArticle =
  (
    articleCreationService: ArticleCreationService,
    articleGeneratingAiService: GenerativeAiService
  ): GenerateUnsavedArticle =>
  async (
    prompt: ArticlePrompt
  ): Promise<Either<GenerateArticleError, UnsavedArticle>> =>
    EitherAsync.fromPromise<AiServiceError, string>(() =>
      articleGeneratingAiService.ask(genereatePromptString(prompt))
    )
      .map((response: string) =>
        articleCreationService.createRawArticle(response, prompt)
      )
      .join()
      .map((rawArticle) =>
        articleCreationService.createUnsavedArticle(rawArticle)
      )
      .join();

const getManyArticles =
  (articleRepository: ArticleRepository) =>
  async (): Promise<Either<GetArticlesError, SimpleArticle[]>> =>
    EitherAsync.fromPromise<GetArticlesError, Article[]>(() =>
      articleRepository.findMany()
    ).map((articles) =>
      articles.map((article) => mapArticleToSimpleArticle(article))
    );

const getArticle =
  (articleRepository: ArticleRepository) =>
  async (id: string): Promise<Either<GetArticleError, Article>> =>
    EitherAsync.fromPromise<GetArticleError, Article>(() =>
      articleRepository.findById(id)
    );

const generateArticle =
  (
    articleCreationService: ArticleCreationService,
    articleGeneratingAiService: GenerativeAiService,
    articleRepository: ArticleRepository
  ): GenerateArticle =>
  async (
    prompt: ArticlePrompt
  ): Promise<Either<GenerateArticleError, Article>> =>
    EitherAsync.fromPromise<GenerateArticleError, UnsavedArticle>(() =>
      generateUnsavedArticle(
        articleCreationService,
        articleGeneratingAiService
      )(prompt)
    )
      .map((unsavedArticle) => articleRepository.create(unsavedArticle))
      .join();

const mapArticleToSimpleArticle = (article: Article): SimpleArticle => ({
  title: article.title,
  id: article.id,
  content: getFirstParagraph(article.content),
  tags: article.tags,
  estimatedReadingTimeMinutes: article.estimatedReadingTimeMinutes,
  date: article.date,
});

const getFirstParagraph = (content: string): string =>
  content.split("\n\n").length > 1
    ? content.split("\n\n")[1]
    : content.substring(0, 200);

const genereatePromptString = (prompt: ArticlePrompt): string => `
You are a professional journalist that writes very nice articles.
I want you yo write me an article about:

Task: ${prompt.task}
Topic: ${prompt.topic}
Style: ${prompt.style}
Tone: ${prompt.tone}
Audience: ${prompt.audience}
Length: ${prompt.length}
Format: JSON
JSON Schema (Make sure to match this format):
{
    title: string;
    tags: string[];
    content: string;
    estimatedReadingTimeMinutes: number;
    relatedTopicsTags: string[];
}
`;
