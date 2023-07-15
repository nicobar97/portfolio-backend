import mongoose, { Schema, Document } from "mongoose";
import { ArticlePrompt } from "../../../core/domain/model/Article";

export type MongooseArticleData = {
  _id: string;
  content: string;
  articlePrompt: ArticlePrompt;
  date: Date;
  title: string;
  tags: string[];
  estimatedReadingTimeMinutes: number;
  relatedTopicsTags: string[];
};

export type MongooseArticle = Document & MongooseArticleData;

export const articleSchema: Schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    content: { type: String, required: true },
    articlePrompt: {
      type: {
        task: { type: String, required: true },
        topic: { type: String, required: true },
        style: { type: String, required: true },
        tone: { type: String, required: true },
        audience: { type: String, required: true },
        length: { type: String, required: true },
      },
      required: true,
    },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    tags: { type: [String], required: true },
    estimatedReadingTimeMinutes: { type: Number, required: true },
    relatedTopicsTags: { type: [String], required: true },
  },
  { collection: "articles" }
);

export const ArticlesMongooseModel = mongoose.model<MongooseArticle>(
  "articles",
  articleSchema
);
