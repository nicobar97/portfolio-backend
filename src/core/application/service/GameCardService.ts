import { Either, EitherAsync } from "purify-ts";
import { GameCard } from "../../domain/model/GameCard";
import {
  FindGameCardByIdError,
  FindManyGameCardsError,
  GameCardRepository,
} from "../../port/CardGameRepository";

export type GameCardFilters = {
  keyword?: string;
  types?: string;
  sets?: string;
  rarities?: string;
  features?: string;
  colors?: string;
  attributes?: string;
};

export type GetGameCardsError = FindManyGameCardsError;
export type GetGameCardError = FindGameCardByIdError;

export type GetGameCards = (
  filters?: GameCardFilters
) => Promise<Either<GetGameCardsError, GameCard[]>>;

export type GetGameCard = (
  id: string
) => Promise<Either<GetGameCardError, GameCard>>;

export type GameCardService = {
  getGameCards: GetGameCards;
  getGameCard: GetGameCard;
};

export const gameCardServiceFactory = (
  gameCardRepository: GameCardRepository
): GameCardService => ({
  getGameCards: getManyGameCards(gameCardRepository),
  getGameCard: getGameCard(gameCardRepository),
});

const getManyGameCards =
  (gameCardRepository: GameCardRepository): GetGameCards =>
  async (filters?: GameCardFilters): Promise<Either<GetGameCardsError, GameCard[]>> =>
    EitherAsync.fromPromise<GetGameCardsError, GameCard[]>(() =>
      gameCardRepository.findMany(filters)
    );

const getGameCard =
  (gameCardRepository: GameCardRepository) =>
  async (id: string): Promise<Either<GetGameCardError, GameCard>> =>
    EitherAsync.fromPromise<GetGameCardError, GameCard>(() =>
      gameCardRepository.findById(id)
    );
