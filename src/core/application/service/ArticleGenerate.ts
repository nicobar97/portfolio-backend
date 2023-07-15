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
  FindManyArticlesError,
} from "../../port/ArticleRepository";

export type Reponse = { content: string };

export type GenerateArticleError =
  | AiServiceError
  | CreateRawArticleError
  | CreateUnsavedArticleError
  | CreateArticleError;

export type GetArticlesError = FindManyArticlesError;

export type GenerateUnsavedArticle = (
  prompt: ArticlePrompt
) => Promise<Either<GenerateArticleError, UnsavedArticle>>;

export type GenerateArticle = (
  prompt: ArticlePrompt
) => Promise<Either<GenerateArticleError, Article>>;

export type GetManysArticles = () => Promise<
  Either<GetArticlesError, Article[]>
>;

export type GenerateArticleService = {
  generateUnsavedArticle: GenerateUnsavedArticle;
  generateArticle: GenerateArticle;
  getManyArticles: GetManysArticles;
};

export const articleGenerateServiceFactory = (
  articleCreationService: ArticleCreationService,
  articleGeneratingAiService: GenerativeAiService,
  articleRepository: ArticleRepository
): GenerateArticleService => ({
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
  async (): Promise<Either<GetArticlesError, Article[]>> =>
    EitherAsync.fromPromise<GetArticlesError, Article[]>(() =>
      articleRepository.findMany()
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

const mapArticleToSimpleArticle = (
  article: Article
): SimpleArticle => ({
  title: article.title,
  id: article.id,
  content: article.content,
  tags: article.tags,
  estimatedReadingTimeMinutes: article.estimatedReadingTimeMinutes,
})

const genereatePromptString = (
  prompt: ArticlePrompt
): string => `
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
