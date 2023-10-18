import { Either } from "purify-ts";
import { GameCard, UnsavedGameCard } from "../domain/model/GameCard";
import { GameCardFilters } from "../application/service/GameCardService";

export type GameCardRepository = {
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

export type FindManyGameCards = (filters: GameCardFilters) => Promise<
  Either<FindManyGameCardsError, GameCard[]>
>;

export type FindManyGameCardsError = {
  type: "findManyGameCardsError";
  message: string;
};
