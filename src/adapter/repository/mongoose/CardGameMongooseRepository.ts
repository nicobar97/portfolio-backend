import { GameCard } from "../../../core/domain/model/GameCard";
import { Either, EitherAsync, Left, Right } from "purify-ts";
import { Logger } from "../../../core/port/Logger";
import {
  GameCardRepository,
  FindGameCardByIdError,
  FindManyGameCardsError,
} from "../../../core/port/CardGameRepository";
import {
  GameCardMongooseModel,
  MongooseGameCard,
} from "./CardGameMongooseSchema";

export const mongooseGameCardsRepositoryFactory = (
  logger: Logger
): GameCardRepository => ({
  findById: findById(logger),
  findMany: findMany(logger),
});

const findById =
  (logger: Logger) =>
  (id: string): Promise<Either<FindGameCardByIdError, GameCard>> =>
    EitherAsync<Error, MongooseGameCard>(() =>
      GameCardMongooseModel.findById(id).exec()
    )
      .map((mongooseGameCard) =>
        mapMongooseGameCardToGameCard(mongooseGameCard)
      )
      .mapLeft(
        (error) =>
          ({
            type: "findGameCardByIdError",
            message:
              error.message || `An error occurred while reading with id ${id}.`,
          } as FindGameCardByIdError)
      )
      .run();

const findMany =
  (logger: Logger) => (): Promise<Either<FindManyGameCardsError, GameCard[]>> =>
    GameCardMongooseModel.find()
      .exec()
      .then(
        (
          mongooseGameCard: MongooseGameCard[] | null
        ): Either<FindManyGameCardsError, GameCard[]> =>
          mongooseGameCard.length === 0
            ? Left({
                type: "findManyGameCardsError",
                message: `GameCards not found.`,
              })
            : Right(mongooseGameCard).map((gameCards) =>
                mapManyMongooseGameCardsToGameCards(gameCards)
              )
      )
      .catch(
        (error: Error): Either<FindManyGameCardsError, GameCard[]> =>
          Left({
            type: "findManyGameCardsError",
            message:
              error.message || `An error occurred while reading gameCards.`,
          })
      );

const mapMongooseGameCardToGameCard = (
  mongooseGameCard: MongooseGameCard
): GameCard => ({
  id: mongooseGameCard.toJSON()._id,
  slug: mongooseGameCard.toJSON().slug,
  set: mongooseGameCard.toJSON().set,
  name: mongooseGameCard.toJSON().name,
  type: mongooseGameCard.toJSON().type,
  rarity: mongooseGameCard.toJSON().rarity,
  image: mongooseGameCard.toJSON().image,
  feature: mongooseGameCard.toJSON().feature,
  color: mongooseGameCard.toJSON().color.split("/"),
  attributes: mongooseGameCard.toJSON().attributes,
  counter: mongooseGameCard.toJSON().counter,
  life: mongooseGameCard.toJSON().life,
  power: mongooseGameCard.toJSON().power,
  remarks: mongooseGameCard.toJSON().remarks,
  text: mongooseGameCard.toJSON().text,
});

const mapManyMongooseGameCardsToGameCards = (
  mongooseGameCards: MongooseGameCard[]
) =>
  mongooseGameCards.map(
    (mongooseGameCard: MongooseGameCard): GameCard =>
      mapMongooseGameCardToGameCard(mongooseGameCard)
  );
