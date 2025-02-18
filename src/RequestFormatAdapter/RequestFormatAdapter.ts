import { GeminiPostTool } from "./GeminiPostTool";
import { OpenApiPostTool } from "./OpenAIPostTool";

export const RequestFormaterTable = {
    openai:OpenApiPostTool,
    gemini:GeminiPostTool,
};
export type RequestFormaterType = keyof typeof RequestFormaterTable;