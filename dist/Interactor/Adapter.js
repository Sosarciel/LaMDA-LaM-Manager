"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractorTable = void 0;
const GeminiRequester_1 = require("./GeminiRequester");
const OpenAIRequester_1 = require("./OpenAIRequester");
exports.InteractorTable = {
    openai: OpenAIRequester_1.OpenAiPostTool,
    gemini: GeminiRequester_1.GeminiPostTool,
};
