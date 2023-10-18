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
import { GameCardFilters } from "../../../core/application/service/GameCardService";

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
  (logger: Logger) =>
  (
    filters: GameCardFilters
  ): Promise<Either<FindManyGameCardsError, GameCard[]>> =>
    GameCardMongooseModel.find(getGameCardsFilters(filters))
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

const getGameCardsFilters = (filters?: GameCardFilters) => {
  const mongoFilters: { [key: string]: unknown } = {};

  if (filters.keyword) {
    mongoFilters["name"] = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.types) {
    mongoFilters["type"] = {
      $in: filters.types.split(",").map((type) => type.trim()),
    };
  }

  if (filters.sets) {
    const regexArray = filters.sets
      .split(",")
      .map((set) => new RegExp(set.trim(), "i"));

    mongoFilters["set"] = {
      $in: regexArray,
    };
  }

  if (filters.rarities) {
    mongoFilters["rarity"] = {
      $in: filters.rarities.split(",").map((type) => type.trim()),
    };
  }

  if (filters.features) {
    mongoFilters["feature"] = {
      $in: filters.features.split(",").map((type) => type.trim()),
    };
  }

  if (filters.colors) {
    mongoFilters["color"] = {
      $in: filters.colors.split(",").map((type) => type.trim()),
    };
  }

  if (filters.attributes) {
    mongoFilters["attributes"] = {
      $in: filters.attributes.split(",").map((type) => type.trim()),
    };
  }

  return mongoFilters;
};
