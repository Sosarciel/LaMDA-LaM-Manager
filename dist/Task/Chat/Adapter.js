"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTaskFormaterTable = void 0;
const Formatter_1 = require("./Formatter");
exports.ChatTaskFormaterTable = {
    deepseek_chat: Formatter_1.DeepseekChatTaskFormatter,
    deepseek_chat_beta: Formatter_1.DeepseekBetaChatTaskFormatter,
    openai_chat: Formatter_1.OpenAIConversationChatTaskFormatter,
    openai_text: Formatter_1.OpenAITextChatTaskFormatter,
    google_chat: Formatter_1.GeminiChatTaskFormatter,
    google_chat_compat: Formatter_1.GeminiCompatChatTaskFormatter,
};
