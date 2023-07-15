import { Either } from "purify-ts";

export type GenerativeAiService = {
  ask: AskAiService;
};

export type AskAiService = (
  prompt: string
) => Promise<Either<AiServiceError, string>>;

export type AiServiceError = {
  type: "ai_service_error";
  provider: 'bard';
  message: string;
};
