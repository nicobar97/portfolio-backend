import { Either, Left, Right } from "purify-ts";
import { TrainDetails, TrainTable } from "../../core/domain/model/Train";
import { MapFetch } from "../service/FetchMapClient";
import { FetchMapError, MappingError } from "../../core/domain/model/errors";
import { JSDOM } from "jsdom";

export type TrainTablesGateway = {
  getAllTrainFromPlaceId: GetAllTrainFromPlaceId;
};

export type GetAllTrainError =
  | {
      type: "getAllTrainError";
      message: string;
    }
  | FetchMapError;

type GetAllTrainFromPlaceId = (
  placeId: string
) => Promise<Either<GetAllTrainError, TrainTable>>;

export const trainTableGatewayFactory = (
  mapFetch: MapFetch
): TrainTablesGateway => ({
  getAllTrainFromPlaceId: getAllTrainFromPlaceId(mapFetch),
});

const getAllTrainFromPlaceId =
  (mapFetch: MapFetch): GetAllTrainFromPlaceId =>
  async (placeId: string): Promise<Either<GetAllTrainError, TrainTable>> =>
    mapFetch
      .fetch<string, TrainTable>(
        `https://iechub.rfi.it/ArriviPartenze/ArrivalsDepartures/Monitor?placeId=${placeId}&arrivals=False`,
        { method: "GET" },
        (htmlContent: string) => generateTrainTableList(placeId, htmlContent)
      )
      .run();

const generateTrainTableList = (
  placeId: string,
  htmlPage: string
): Either<MappingError, TrainTable> => {
  try {
    const dom = new JSDOM(htmlPage);
    const document = dom.window.document;

    const tableRows = document.querySelectorAll("tr[id][name]");

    const trainDetailsRows: TrainDetails[] = [];
    for (const row of tableRows) {
      const trainId = row.getAttribute("id");
      const provider = row
        .querySelector("td[id=RVettore] img")
        .getAttribute("alt")
        .toLowerCase();
      const category = row
        .querySelector("td[id=RCategoria] img")
        .getAttribute("alt").replace("Categoria", "").trim();
      const destination = row
        .querySelector("td[id=RStazione] div")
        .textContent.trim();
      const departureTime = row
        .querySelector("td[id=ROrario]")
        .textContent.trim();
      const delay =
        Number(row.querySelector("td[id=RRitardo]").textContent.trim()) || 0;
      const binary = row
        .querySelector("td[id=RBinario] div")
        .textContent.trim();
      const isDepartingImg = row.querySelector("td[id=RExLampeggio] img");
      const isDeparting =
        isDepartingImg && isDepartingImg.getAttribute("alt") === "Si" ? true : false;

      const trainDetails: TrainDetails = {
        trainId,
        provider,
        category,
        destination,
        departureTime,
        delay,
        binary,
        isDeparting,
      };

      trainDetailsRows.push(trainDetails);
    }

    const trainTable: TrainTable = {
      placeId,
      lines: trainDetailsRows,
      place: document.querySelector("h1[id=nomeStazioneId]").innerHTML.trim(),
    };

    return Right(trainTable);
  } catch (e) {
    return Left({
      type: "mapping_error",
      message: "Something went wrong in parsing html page from provider",
    } as MappingError);
  }
};
