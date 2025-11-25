import { GeminiPostTool } from "./GeminiRequester";
import { OpenAiPostTool } from "./OpenAIRequester";

export const InteractorTable = {
    openai:OpenAiPostTool,
    gemini:GeminiPostTool,
};
export type InteractorType = keyof typeof InteractorTable;