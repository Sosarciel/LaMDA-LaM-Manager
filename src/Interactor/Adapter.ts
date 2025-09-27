import { GeminiPostTool } from "./GeminiRequester";
import { OpenApiPostTool } from "./OpenAIRequester";

export const InteractorTable = {
    openai:OpenApiPostTool,
    gemini:GeminiPostTool,
};
export type InteractorType = keyof typeof InteractorTable;