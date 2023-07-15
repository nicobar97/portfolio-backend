export type UnsavedArticle = {
  type: "unsaved_article";
  content: string;
  articlePrompt: ArticlePrompt;
  date: Date;
  title: string;
  tags: string[];
  estimatedReadingTimeMinutes: number;
  relatedTopicsTags: string[];
};

export type RawArticle = {
  type: "raw_article";
  title: string;
  articlePrompt: ArticlePrompt;
  content: string;
  tags: string[];
  estimatedReadingTimeMinutes: string | number;
  relatedTopicsTags: string[];
};

export type Article = Omit<UnsavedArticle, "type"> & {
  id: string;
  type: "article";
};

export type SimpleArticle = {
  title: string;
  id: string;
  content: string;
  tags: string[];
  estimatedReadingTimeMinutes: number;
};

export type ArticlePrompt = {
  task: string;
  topic: string;
  style: string;
  tone: string;
  audience: string;
  length: string;
};

[
  {
    name: "Task",
    options: [
      "Write a cold email",
      "Write a blogpost",
      "Write 5 taglines",
      "Write a youtube video title",
      "Summarize in 3 paragraphs",
      "Translate from English to Spanish",
      "Create a tweet thread of 10 tweets",
    ],
  },
  {
    name: "Topic",
  },
  {
    name: "Style",
    options: [
      "Academic",
      "Business",
      "Casual",
      "Creative",
      "Descriptive",
      "Emotional",
      "Expository",
      "Formal",
      "Informal",
      "Legal",
      "Medical",
      "Narrative",
      "Persuasive",
      "Poetic",
      "Technical",
    ],
  },
  {
    name: "Tone",
    options: [
      "Angry",
      "Assertive",
      "Confident",
      "Cooperative",
      "Curious",
      "Empathetic",
      "Encouraging",
      "Enthusiastic",
      "Excited",
      "Friendly",
      "Funny",
      "Joyful",
      "Optimistic",
      "Professional",
      "Sad",
      "Serious",
      "Surprised",
      "Worried",
    ],
  },
  {
    name: "Audience",
    options: [
      "5-year old",
      "10-year old",
      "Teenager",
      "20-year old",
      "30-year old",
      "40-year old",
      "50-year old",
      "60-year old",
      "70-year old",
      "",
      "Business audience",
      "Expert audience",
      "Hostile audience",
      "Neutral audience",
      "Uninformed audience",
      "",
      "My boss",
      "My teacher",
      "My parent",
      "My partner",
      "My child",
      "My colleague",
    ],
  },
  {
    name: "Length",
    options: [
      "1 paragraph",
      "2 paragraphs",
      "3 paragraphs",
      "",
      "20 words",
      "50 words",
      "100 words",
      "200 words",
      "500 words",
    ],
  },
  {
    name: "Format",
    options: ["Text", "HTML", "JSON", "markdown", "XML", "csv"],
  },
];

const TaskEnum = {
  WriteColdEmail: "Write a cold email",
  WriteBlogpost: "Write a blogpost",
  WriteTaglines: "Write 5 taglines",
  WriteYouTubeTitle: "Write a YouTube video title",
  SummarizeParagraphs: "Summarize in 3 paragraphs",
  TranslateEnglishToSpanish: "Translate from English to Spanish",
  CreateTweetThread: "Create a tweet thread of 10 tweets",
} as const;

type TaskEnumKey = keyof typeof TaskEnum;
export type TaskEnumType = (typeof TaskEnum)[TaskEnumKey];

const TopicEnum = {
  Topic: "Topic",
} as const;

type TopicEnumKey = keyof typeof TopicEnum;
export type TopicEnumType = (typeof TopicEnum)[TopicEnumKey];

const StyleEnum = {
  Academic: "Academic",
  Business: "Business",
  Casual: "Casual",
  Creative: "Creative",
  Descriptive: "Descriptive",
  Emotional: "Emotional",
  Expository: "Expository",
  Formal: "Formal",
  Informal: "Informal",
  Legal: "Legal",
  Medical: "Medical",
  Narrative: "Narrative",
  Persuasive: "Persuasive",
  Poetic: "Poetic",
  Technical: "Technical",
} as const;

type StyleEnumKey = keyof typeof StyleEnum;
export type StyleEnumType = (typeof StyleEnum)[StyleEnumKey];

const ToneEnum = {
  Angry: "Angry",
  Assertive: "Assertive",
  Confident: "Confident",
  Cooperative: "Cooperative",
  Curious: "Curious",
  Empathetic: "Empathetic",
  Encouraging: "Encouraging",
  Enthusiastic: "Enthusiastic",
  Excited: "Excited",
  Friendly: "Friendly",
  Funny: "Funny",
  Joyful: "Joyful",
  Optimistic: "Optimistic",
  Professional: "Professional",
  Sad: "Sad",
  Serious: "Serious",
  Surprised: "Surprised",
  Worried: "Worried",
} as const;

type ToneEnumKey = keyof typeof ToneEnum;
export type ToneEnumType = (typeof ToneEnum)[ToneEnumKey];

const AudienceEnum = {
  FiveYearOld: "5-year old",
  TenYearOld: "10-year old",
  Teenager: "Teenager",
  TwentyYearOld: "20-year old",
  ThirtyYearOld: "30-year old",
  FortyYearOld: "40-year old",
  FiftyYearOld: "50-year old",
  SixtyYearOld: "60-year old",
  SeventyYearOld: "70-year old",
  BusinessAudience: "Business audience",
  ExpertAudience: "Expert audience",
  HostileAudience: "Hostile audience",
  NeutralAudience: "Neutral audience",
  UninformedAudience: "Uninformed audience",
  MyBoss: "My boss",
  MyTeacher: "My teacher",
  MyParent: "My parent",
  MyPartner: "My partner",
  MyChild: "My child",
  MyColleague: "My colleague",
} as const;

type AudienceEnumKey = keyof typeof AudienceEnum;
export type AudienceEnumType = (typeof AudienceEnum)[AudienceEnumKey];

const LengthEnum = {
  OneParagraph: "1 paragraph",
  TwoParagraphs: "2 paragraphs",
  ThreeParagraphs: "3 paragraphs",
  TwentyWords: "20 words",
  FiftyWords: "50 words",
  OneHundredWords: "100 words",
  TwoHundredWords: "200 words",
  FiveHundredWords: "500 words",
} as const;

type LengthEnumKey = keyof typeof LengthEnum;
export type LengthEnumType = (typeof LengthEnum)[LengthEnumKey];

const FormatEnum = {
  Text: "Text",
  HTML: "HTML",
  JSON: "JSON",
  Markdown: "markdown",
  XML: "XML",
  CSV: "csv",
} as const;

type FormatEnumKey = keyof typeof FormatEnum;
export type FormatEnumType = (typeof FormatEnum)[FormatEnumKey];
