export type TrainTable = {
    placeId: string;
    place: string;
    lines: TrainDetails[];
}

export type TrainDetails = {
    provider: string;
    category: string;
    trainId: string;
    destination: string;
    departureTime: string;
    delay: number;
    binary: string;
    isDeparting: boolean;
}
