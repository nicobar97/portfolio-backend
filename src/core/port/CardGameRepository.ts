import { Either } from "purify-ts";
import { GameCard, UnsavedGameCard } from "../domain/model/GameCard";

export type GameCardRepository = {
  // create: CreateGameCard;
  findById: FindGameCardById;
  findMany: FindManyGameCards;
};

export type CreateGameCard = (
  gameCard: UnsavedGameCard
) => Promise<Either<CreateGameCardError, GameCard>>;

export type CreateGameCardError = {
  type: "createGameCardError";
  message: string;
};

export type FindGameCardById = (
  id: string
) => Promise<Either<FindGameCardByIdError, GameCard>>;

export type FindGameCardByIdError = {
  type: "findGameCardByIdError";
  message: string;
};

export type FindManyGameCards = () => Promise<
  Either<FindManyGameCardsError, GameCard[]>
>;

export type FindManyGameCardsError = {
  type: "findManyGameCardsError";
  message: string;
};
