import { Either, Left, Right } from "purify-ts";
import { AiServiceError } from "../../port/GenerativeAiService";
import { ArticlePrompt, RawArticle, UnsavedArticle } from "../model/Article";

export type JsonParseError = {
  type: "json_parse_error";
  message: string;
  cleanResponse: string;
};

export type CleanResponseError = {
  type: "clean_response_error";
  message: string;
  extractResponse: string;
};

export type AtricleMappingError = {
  type: "article_mapping_error";
  message: string;
  key: string;
};

export type ExtractResponseError = {
  type: "raw_response_error";
  message: string;
  rawResponse: string;
};

export type CreateUnsavedArticleError = AtricleMappingError;
export type CreateRawArticleError =
  | JsonParseError
  | ExtractResponseError
  | CleanResponseError;

export type CreateUnsavedArticle = (
  rawArticle: RawArticle
) => Either<CreateUnsavedArticleError, UnsavedArticle>;

export type CreateRawArticle = (
  rawResponse: string,
  prompt: ArticlePrompt
) => Either<CreateRawArticleError, RawArticle>;

export type ArticleCreationService = {
  createRawArticle: CreateRawArticle;
  createUnsavedArticle: CreateUnsavedArticle;
};

export const openAiArticleCreationServiceFactory = (): ArticleCreationService => ({
  createRawArticle: createRawArticle(),
  createUnsavedArticle: createUnsavedArticle(),
});

const createRawArticle =
  (): CreateRawArticle =>
  (
    rawResponse: string,
    prompt: ArticlePrompt
  ): Either<CreateRawArticleError, RawArticle> =>
    extractResponse(rawResponse)
      .map((extractResponse) => cleanResponse(extractResponse, prompt))
      .join()
      .map((cleanResponse) => mapToRawArticle(cleanResponse, prompt))
      .join();

const createUnsavedArticle =
  (): CreateUnsavedArticle =>
  (rawArticle: RawArticle): Either<CreateUnsavedArticleError, UnsavedArticle> =>
    mapToUnsavedArticle(rawArticle);

const formatContent = (content: string): string => content;

const extractResponse = (
  rawResponse: string
): Either<ExtractResponseError, string> => {
  try {
    return Right(rawResponse);
  } catch (e) {
    return Left({
      type: "raw_response_error",
      message: "Error parsing rawResponse",
      rawResponse,
    });
  }
};

const cleanResponse = (
  extractResponse: string,
  prompt: ArticlePrompt
): Either<CleanResponseError, string> => {
  try {
    let cleanedResponse = "";
    const items = extractResponse.split('"');
    for (const it in items) {
      if (Number(it) % 2 === 0) {
        cleanedResponse +=
          items[it].replaceAll("\n", "") + '"';
      } else {
        cleanedResponse += items[it] + '"';
      }
    }
    cleanedResponse = cleanedResponse.slice(0, cleanedResponse.length - 1);
    return Right(cleanedResponse);
  } catch (e) {
    return Left({
      type: "clean_response_error",
      message: e.message,
      extractResponse,
    });
  }
};

const mapToRawArticle = (
  cleanResponse: string,
  prompt: ArticlePrompt
): Either<JsonParseError, RawArticle> => {
  try {
    const rawArticle: RawArticle = {
      ...JSON.parse(cleanResponse),
      articlePrompt: prompt,
    };
    return Right(rawArticle);
  } catch (e) {
    return Left({
      type: "json_parse_error",
      message: e.message,
      cleanResponse,
    });
  }
};

const mapToUnsavedArticle = (
  rawArticle: RawArticle
): Either<AtricleMappingError, UnsavedArticle> => {
  if (typeof rawArticle.content !== "string") {
    return Left({
      type: "article_mapping_error",
      message: "RawArticle.content is not a string",
      key: "content",
    });
  }
  if (typeof rawArticle.tags !== "object") {
    return Left({
      type: "article_mapping_error",
      message: "RawArticle.tags is not a string",
      key: "tags",
    });
  }
  if (typeof rawArticle.relatedTopicsTags !== "object") {
    return Left({
      type: "article_mapping_error",
      message: "RawArticle.relatedTopicsTags is not a string",
      key: "relatedTopicsTags",
    });
  }
  if (typeof rawArticle.articlePrompt !== "object") {
    return Left({
      type: "article_mapping_error",
      message: "RawArticle.articlePrompt is not a string",
      key: "articlePrompt",
    });
  }
  return Right({
    content: rawArticle.content,
    title: rawArticle.title,
    formatted_content: formatContent(rawArticle.content),
    articlePrompt: rawArticle.articlePrompt,
    date: new Date(),
    tags: rawArticle.tags,
    estimatedReadingTimeMinutes:
      typeof rawArticle.estimatedReadingTimeMinutes === "string"
        ? parseInt(rawArticle.estimatedReadingTimeMinutes)
        : rawArticle.estimatedReadingTimeMinutes,
    relatedTopicsTags: rawArticle.relatedTopicsTags,
  });
};
