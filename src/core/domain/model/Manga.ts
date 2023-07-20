export type RawChapter = {
  type: "raw_chapter";
  provider: SupportedProvider;
  html: string;
};

export type RawChapterList = {
  type: "raw_chapter_list";
  provider: SupportedProvider;
  html: string;
};

export type RawMangaList = {
  type: "raw_manga_list";
  provider: SupportedProvider;
  html: string;
};

export type MangaList = {
  provider: SupportedProvider;
  mangas: SimpleManga[];
};

export type SimpleManga = {
  title: string;
  image: string;
  provider: SupportedProvider;
  url: string;
};

export type ChapterList = {
  title: string;
  provider: SupportedProvider;
  chapters: SimpleChapter[];
};

export type SimpleChapter = {
  title: string;
  number: number;
  provider: SupportedProvider;
  url: string;
};

export type Manga = {
  type: "manga";
  id: string;
  title: string;
  number: number;
  provider: SupportedProvider;
  pages: number;
  tags: string[];
  chapters: Chapter[];
};

export type Chapter = {
  type: "chapter";
  id: string;
  mangaId: string;
  title: string;
  number: number;
  provider: SupportedProvider;
  pages: ChapterPage[];
  tags: string[];
};

export type ChapterPage = {
  type: "chapter_page";
  id: string;
  mangaId: string;
  chapterId: string;
  chapter: number;
  title: string;
  provider: SupportedProvider;
  url: string;
  pageNumber: number;
};

export const SupportedProviders = {
  TCBScans: "TCBScans",
  NIFTeam: "NIFTeam",
} as const;
export type SupportedProvider =
  (typeof SupportedProviders)[keyof typeof SupportedProviders];
//   RawManga<typeof SupportedProviders.TCBScans>;

export const getDomainFromProvider = (provider: SupportedProvider) => {
  switch (provider) {
    case SupportedProviders.TCBScans:
      return "https://tcbscans.com/";

    case SupportedProviders.NIFTeam:
      return "https://nifteam.com/";
  }
};
