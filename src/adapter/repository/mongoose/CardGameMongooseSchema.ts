import mongoose, { Schema, Document } from "mongoose";

export type MongooseGameCardData = {
  _id: string;
  slug: string;
  set: string;
  type: string;
  rarity: string;
  name: string;
  image: {
    en: string;
    jp: string;
  };
  feature: string;
  color: string;
  life: number;
  power: number;
  counter: null | string;
  text: string;
  attributes: string;
  remarks: string;
};


export type MongooseGameCard = Document & MongooseGameCardData;

export const gameCardSchema: Schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true },
    set: { type: String, required: true },
    type: { type: String, required: true },
    rarity: { type: String, required: true },
    name: { type: String, required: true },
    image: {
      en: { type: String, required: true },
      jp: { type: String, required: true },
    },
    feature: { type: String, required: true },
    color: { type: String, required: true },
    life: { type: Number, required: true },
    power: { type: Number, required: true },
    counter: { type: String, required: false },
    text: { type: String, required: true },
    attributes: { type: String, required: true },
    remarks: { type: String, required: false },
  },
  { collection: "card_game_one_piece" }
);

export const GameCardMongooseModel = mongoose.model<MongooseGameCard>(
  "card_game_one_piece",
  gameCardSchema
);
