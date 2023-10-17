import { Either, EitherAsync } from "purify-ts";
import { GameCard } from "../../domain/model/GameCard";
import {
  FindGameCardByIdError,
  FindManyGameCardsError,
  GameCardRepository,
} from "../../port/CardGameRepository";

export type Reponse = { content: string };

export type GetGameCardsError = FindManyGameCardsError;
export type GetGameCardError = FindGameCardByIdError;

export type GetManysGameCards = () => Promise<
  Either<GetGameCardsError, GameCard[]>
>;

export type GetGameCard = (
  id: string
) => Promise<Either<GetGameCardError, GameCard>>;

export type GameCardService = {
  getManyGameCards: GetManysGameCards;
  getGameCard: GetGameCard;
};

export const gameCardServiceFactory = (
  gameCardRepository: GameCardRepository
): GameCardService => ({
  getManyGameCards: getManyGameCards(gameCardRepository),
  getGameCard: getGameCard(gameCardRepository),
});

const getManyGameCards =
  (gameCardRepository: GameCardRepository) =>
  async (): Promise<Either<GetGameCardsError, GameCard[]>> =>
    EitherAsync.fromPromise<GetGameCardsError, GameCard[]>(() =>
      gameCardRepository.findMany()
    );
const getGameCard =
  (gameCardRepository: GameCardRepository) =>
  async (id: string): Promise<Either<GetGameCardError, GameCard>> =>
    EitherAsync.fromPromise<GetGameCardError, GameCard>(() =>
      gameCardRepository.findById(id)
    );
