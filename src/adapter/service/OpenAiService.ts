import { Either, Right, Left } from "purify-ts";
import {
  AiServiceError,
  AskAiService,
  GenerativeAiService,
} from "../../core/port/GenerativeAiService";
import Bard from "./bard";
import { OpenAIApi } from "openai";

export const openAiServiceFactory = (openai: OpenAIApi): GenerativeAiService => ({
  ask: askOpenAi(openai),
});

const askOpenAi =
  (openai: OpenAIApi): AskAiService =>
  async (prompt: string): Promise<Either<AiServiceError, string>> => {
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
      });
      return Right(response.data.choices[0].message.content);
    } catch (error) {
      return Left({
        type: "ai_service_error",
        provider: "bard",
        message: error.message,
      });
    }
  };
