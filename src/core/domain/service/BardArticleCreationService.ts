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

export const bardArticleCreationServiceFactory =
  (): ArticleCreationService => ({
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
const getTitle = (content: string): string => "No Title atm";

const extractResponse = (
  rawResponse: string
): Either<ExtractResponseError, string> => {
  try {
    const extractResponse = rawResponse.split("```json")[1].split("```")[0];
    console.log(`Extract: ${extractResponse}`);
    return Right(extractResponse);
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
          items[it].replaceAll("\n", "").replaceAll('\\"', '"') + '"';
      } else {
        cleanedResponse += items[it].replaceAll('\\"', '"') + '"';
      }
    }
    cleanedResponse = cleanedResponse.slice(0, cleanedResponse.length - 1);
    cleanedResponse = cleanedResponse.replaceAll('\\"', '"');

    // cleanedResponse = cleanAndFixJson(extractResponse);
    cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 1);
    return Right(extractResponse);
  } catch (e) {
    return Left({
      type: "clean_response_error",
      message: e.message,
      extractResponse,
    });
  }
};

// function cleanAndFixJson(malformedJson: string) {
//   let cleanedJson = malformedJson;

//   // Remove leading/trailing whitespaces
//   cleanedJson = cleanedJson.trim();

//   // Remove line breaks and extra whitespaces within values
//   cleanedJson = cleanedJson.replace(/\s+/g, " ");

//   // Add double quotes around keys
//   cleanedJson = cleanedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

//   // Add double quotes around string values
//   cleanedJson = cleanedJson.replace(/:\s*([^"][^:,{}\]\[]+)([,}])/g, ':"$1"$2');

//   // Fix single quotes to double quotes
//   cleanedJson = cleanedJson.replace(/'/g, '"');

//   // Fix unquoted keys
//   cleanedJson = cleanedJson.replace(
//     /([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g,
//     '$1"$2"$3'
//   );

//   // Fix missing comma after key-value pairs
//   cleanedJson = cleanedJson.replace(/}(?!\s*[,}])/g, "},");

//   return cleanedJson;
// }

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
  if (
    typeof rawArticle.estimatedReadingTimeMinutes !== "string" ||
    typeof rawArticle.estimatedReadingTimeMinutes !== "number"
  ) {
    console.log(
      `EstimatedReadingTimeMinutes: ${rawArticle.estimatedReadingTimeMinutes}`
    );
    console.log(JSON.stringify(rawArticle));
    return Left({
      type: "article_mapping_error",
      message:
        "RawArticle.estimatedReadingTimeMinutes is not a string or number",
      key: "estimatedReadingTimeMinutes",
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
    type: "unsaved_article",
    content: rawArticle.content,
    title: getTitle(rawArticle.content),
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
