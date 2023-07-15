import { Either } from "purify-ts";

export type HttpClient = {
  request: MakeRequest;
};

export type HttpResponse = {
  status: number;
  data?: object;
};

export type HttpErrorDetails = {
  url: string;
  method: string;
  status: number;
  headers?: object;
  data?: object;
};

export type RequestOptions = {
  method: string;
  headers: object;
  body?: string;
};

export type MakeRequest = (
  url: string,
  opts?: RequestOptions
) => Promise<Either<HttpError, HttpResponse>>;
export type HttpError = {
  type: "http_error";
  details: HttpErrorDetails;
  message: string;
};
