import { Either, Right, Left } from "purify-ts";
import {
  AiServiceError,
  AskAiService,
  GenerativeAiService,
} from "../../core/port/GenerativeAiService";
import Bard from "./bard";

export const googleBardServiceFactory = (bard: Bard): GenerativeAiService => ({
  ask: askBard(bard),
});

const askBard =
  (bard: Bard): AskAiService =>
  async (prompt: string): Promise<Either<AiServiceError, string>> =>
    bard.ask(prompt)
      .then((response) => Right(response as string))
      .catch((error) =>
        Left({
          type: "ai_service_error",
          provider: "bard",
          message: error.message,
        })
      );
