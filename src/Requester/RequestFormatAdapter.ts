import { GeminiPostTool } from "./GeminiRequester";
import { OpenApiPostTool } from "./OpenAIRequester";

export const RequestFormaterTable = {
    openai:OpenApiPostTool,
    gemini:GeminiPostTool,
};
export type RequestFormaterType = keyof typeof RequestFormaterTable;