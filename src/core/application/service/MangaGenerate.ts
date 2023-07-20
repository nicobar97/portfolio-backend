import { Either, EitherAsync, Right } from "purify-ts";
import {
  Chapter,
  ChapterList,
  MangaList,
  RawChapter,
  RawChapterList,
  RawMangaList,
  SupportedProvider,
  SupportedProviders,
  getDomainFromProvider,
} from "../../domain/model/Manga";
import {
  ChapterCreationService,
  CreateChapterError,
  CreateChapterListError,
  CreateMangaListError,
} from "../../domain/service/MangaCreationService";
import { MapFetch } from "../../../adapter/service/FetchMapClient";
import { FetchMapError } from "../../domain/model/errors";

export type Reponse = { content: string };

export type GenerateChapterError = CreateChapterError | FetchMapError;
export type GenerateChapterListError = CreateChapterListError | FetchMapError;
export type GenerateMangaListError = CreateMangaListError | FetchMapError;

export type GenerateChapter = (
  url: string,
  provider: SupportedProvider
) => Promise<Either<GenerateChapterError, Chapter>>;

export type GenerateChapterList = (
  url: string,
  provider: SupportedProvider
) => Promise<Either<GenerateChapterListError, ChapterList>>;

export type GenerateMangaList = (
  provider: SupportedProvider
) => Promise<Either<GenerateMangaListError, MangaList>>;

export type MangaGenerateService = {
  generateChapter: GenerateChapter;
  generateChapterList: GenerateChapterList;
  generateMangaList: GenerateMangaList;
};

export const mangaGenerateServiceFactory = (
  mapFetch: MapFetch,
  chapterCreationService: ChapterCreationService
): MangaGenerateService => ({
  generateChapter: generateChapter(mapFetch, chapterCreationService),
  generateChapterList: generateChapterList(mapFetch, chapterCreationService),
  generateMangaList: generateMangaList(mapFetch, chapterCreationService),
});

const generateChapter =
  (
    mapFetch: MapFetch,
    chapterCreationService: ChapterCreationService
  ): GenerateChapter =>
  async (
    url: string,
    provider: SupportedProvider
  ): Promise<Either<GenerateChapterError, Chapter>> =>
    mapFetch
      .fetch<string, RawChapter>(
        `${getDomainFromProvider(provider)}${url}`,
        { method: "GET" },
        (htmlContent: string) =>
          Right(chapterCreationService.createRawChapter(htmlContent, provider))
      )
      .map((rawChapter: RawChapter) =>
        chapterCreationService.createChapter(rawChapter)
      )
      .join()
      .run();

const generateChapterList =
  (
    mapFetch: MapFetch,
    chapterCreationService: ChapterCreationService
  ): GenerateChapterList =>
  async (
    url: string,
    provider: SupportedProvider
  ): Promise<Either<GenerateChapterListError, ChapterList>> =>
    mapFetch
      .fetch<string, RawChapterList>(
        `${getDomainFromProvider(provider)}${url}`,
        { method: "GET" },
        (htmlContent: string) =>
          Right(
            chapterCreationService.createRawChapterList(htmlContent, provider)
          )
      )
      .map((rawChapterList: RawChapterList) =>
        chapterCreationService.createChapterList(rawChapterList)
      )
      .join()
      .run();

const generateMangaList =
  (
    mapFetch: MapFetch,
    chapterCreationService: ChapterCreationService
  ): GenerateMangaList =>
  async (
    provider: SupportedProvider
  ): Promise<Either<GenerateMangaListError, MangaList>> =>
    mapFetch
      .fetch<string, RawMangaList>(
        `${getDomainFromProvider(provider)}/projects`,
        { method: "GET" },
        (htmlContent: string) =>
          Right(
            chapterCreationService.createRawMangaList(htmlContent, provider)
          )
      )
      .map((rawMangaList: RawMangaList) =>
        chapterCreationService.createMangaList(rawMangaList)
      )
      .join()
      .run();
