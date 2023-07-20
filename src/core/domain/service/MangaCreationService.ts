import { Either, Left, Right } from "purify-ts";
import {
  SupportedProvider,
  RawChapter,
  Chapter,
  ChapterPage,
  RawChapterList,
  ChapterList,
  RawMangaList,
  MangaList,
  SimpleManga,
} from "../model/Manga";
import { JSDOM } from "jsdom";

export type DomParseError = {
  type: "dom_parse_error";
  message: string;
  provider: string;
};

export type CleanResponseError = {
  type: "clean_response_error";
  message: string;
  extractResponse: string;
};

export type ChapterMappingError = {
  type: "chapter_mapping_error";
  message: string;
  provider: string;
};

export type ExtractResponseError = {
  type: "raw_response_error";
  message: string;
  rawResponse: string;
};

export type CreateMangaError = ChapterMappingError;
export type CreateChapterError = DomParseError;
export type CreateChapterListError = DomParseError;
export type CreateMangaListError = DomParseError;
export type CreateRawMangaError =
  | DomParseError
  | ExtractResponseError
  | CleanResponseError;

export type CreateRawChapter = (
  htmlPageContent: string,
  provider: SupportedProvider
) => RawChapter;
export type CreateRawChapterList = (
  htmlPageContent: string,
  provider: SupportedProvider
) => RawChapterList;
export type CreateRawMangaList = (
  htmlPageContent: string,
  provider: SupportedProvider
) => RawMangaList;
export type CreateChapter = (
  rawChapter: RawChapter
) => Either<CreateChapterError, Chapter>;
export type CreateChapterList = (
  rawChapterList: RawChapterList
) => Either<CreateChapterListError, ChapterList>;
export type CreateMangaList = (
  rawMangaList: RawMangaList
) => Either<CreateMangaListError, MangaList>;

export type ChapterCreationService = {
  createRawChapter: CreateRawChapter;
  createChapter: CreateChapter;
  createRawChapterList: CreateRawChapterList;
  createChapterList: CreateChapterList;
  createRawMangaList: CreateRawMangaList;
  createMangaList: CreateMangaList;
};

export const chapterCreationServiceFactory = (): ChapterCreationService => ({
  createRawChapter: createRawChapter(),
  createChapter: createChapter(),
  createRawChapterList: createRawChapterList(),
  createChapterList: createChapterList(),
  createRawMangaList: createRawMangaList(),
  createMangaList: createMangaList(),
});

const createRawMangaList =
  () =>
  (htmlContent: string, provider: SupportedProvider): RawMangaList => ({
    type: "raw_manga_list",
    html: htmlContent,
    provider: provider,
  });

const createRawChapterList =
  () =>
  (htmlContent: string, provider: SupportedProvider): RawChapterList => ({
    type: "raw_chapter_list",
    html: htmlContent,
    provider: provider,
  });

const createMangaList =
  () =>
  (rawMangaList: RawMangaList): Either<CreateMangaListError, MangaList> => {
    try {
      const { html, provider } = rawMangaList;

      const MangaList: MangaList = {
        provider: provider,
        mangas: getSimpleMangas(rawMangaList),
      };

      return Right(MangaList);
    } catch (e) {
      console.log(e);
      return Left({
        type: "dom_parse_error",
        message: "Error parsing rawResponse",
        provider: rawMangaList.provider,
      });
    }
  };

const getSimpleMangas = (rawMangaList: RawMangaList) => {
  const dom = new JSDOM(rawMangaList.html);
  const document = dom.window.document;
  const divs = document.querySelectorAll("div[class*='card']");

  const mangas: SimpleManga[] = [];
  for (const div of divs) {
    const sp: SimpleManga = {
      title: div.querySelector("img").getAttribute("alt"),
      image: div.querySelector("img").getAttribute("src"),
      provider: rawMangaList.provider,
      url: div.querySelector("a").getAttribute("href"),
    };
    mangas.push(sp);
  }
  return mangas;
};

const createChapterList =
  () =>
  (
    rawChapterList: RawChapterList
  ): Either<CreateChapterListError, ChapterList> => {
    try {
      const { html, provider } = rawChapterList;

      const dom = new JSDOM(html);
      const document = dom.window.document;

      const chapterList: ChapterList = {
        title:
          document
            .querySelector("head")
            .querySelector("meta[property='og:title']")
            .getAttribute("content")
            .split("|")[0]
            .trim() ?? "Unknown Title",
        provider: provider,
        chapters: Array.from(document.querySelectorAll("a[href][class]"))
          .map((a) => {
            console.log(a.innerHTML);
            if (a.innerHTML.includes("pter")) {
              const title = a.innerHTML.split(">")[1].split("<")[0].trim();
              return {
                title,
                url: a.getAttribute("href"),
                provider: provider,
                number: Number(title.split("pter")[1].trim()),
              };
            } else {
              return null;
            }
          })
          .filter((item) => item !== null),
      };

      return Right(chapterList);
    } catch (e) {
      console.log(e);
      return Left({
        type: "dom_parse_error",
        message: "Error parsing rawResponse",
        provider: rawChapterList.provider,
      });
    }
  };
const createRawChapter =
  () =>
  (htmlContent: string, provider: SupportedProvider): RawChapter => ({
    type: "raw_chapter",
    html: htmlContent,
    provider: provider,
  });

const createChapter =
  () =>
  (rawChapter: RawChapter): Either<CreateChapterError, Chapter> => {
    try {
      const { html, provider } = rawChapter;

      const dom = new JSDOM(html);
      const document = dom.window.document;

      const titleElement = document.querySelector("h1.text-lg");
      const title = titleElement?.textContent?.trim() || "Unknown Title";

      const imagesWithTitle: { image: string; title: string }[] = Array.from(
        document.querySelectorAll("img.fixed-ratio-content")
      )
        .map((img) => ({
          image: img.getAttribute("src"),
          title: img.getAttribute("alt"),
        }))
        .filter((it) => it !== null);

      // Extract chapter number (example: One Piece - Chapter 1088)
      const chapterNumberMatch = title.match(/Chapter\s+(\d+)/i);
      const chapterNumber = chapterNumberMatch
        ? parseInt(chapterNumberMatch[1])
        : -1;

      const pages: ChapterPage[] = createChapterPages(
        imagesWithTitle,
        provider,
        chapterNumber
      );
      const tags: string[] = [];

      const chapter: Chapter = {
        type: "chapter",
        id: "some-unique-id",
        mangaId: "some-manga-id",
        title: title,
        number: chapterNumber,
        provider: provider,
        pages: pages,
        tags: tags,
      };

      return Right(chapter);
    } catch (e) {
      console.log(e);
      return Left({
        type: "dom_parse_error",
        message: "Error parsing rawResponse",
        provider: rawChapter.provider,
      });
    }
  };

const createChapterPages = (
  imagesWithTitle: { image: string; title: string }[],
  provider: SupportedProvider,
  chapterNumber: number
): ChapterPage[] =>
  imagesWithTitle.map(({ image, title }, index) => ({
    type: "chapter_page",
    id: "some-unique-id",
    mangaId: "some-manga-id",
    chapterId: "some-chapter-id",
    chapter: chapterNumber,
    pageNumber: index,
    title: title,
    provider: provider,
    url: image,
  }));
