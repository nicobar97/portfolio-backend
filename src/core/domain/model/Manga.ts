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
  type: "manga_list";
  provider: SupportedProvider;
  count: number;
  mangas: SimpleManga[];
};

export type SimpleManga = {
  type: "simple_manga";
  title: string;
  image: string;
  provider: SupportedProvider;
  url: string;
};

export type ChapterList = {
  type: "chapter_list";
  title: string;
  provider: SupportedProvider;
  count: number;
  chapters: SimpleChapter[];
};

export type SimpleChapter = {
  type: "simple_chapter";
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
  count: number;
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

export const getDomainFromProvider = (provider: SupportedProvider) => {
  switch (provider) {
    case SupportedProviders.TCBScans:
      return "https://tcbscans.com";

    case SupportedProviders.NIFTeam:
      return "https://nifteam.com";
  }
};
