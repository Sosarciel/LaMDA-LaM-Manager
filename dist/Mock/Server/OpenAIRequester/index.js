"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procOpenAIChat = void 0;
const utils_1 = require("@zwa73/utils");
const DeepseekChat_1 = require("./DeepseekChat");
const GPT35Chat_1 = require("./GPT35Chat");
const GPT35Text_1 = require("./GPT35Text");
const procOpenAIChat = (data) => {
    if (utils_1.UtilFunc.checkSharpSchema(data, {
        model: "string",
    })) {
        return (0, utils_1.match)(data.model, {
            'gpt-3.5-turbo': () => (0, GPT35Chat_1.procGPT35Chat)(data),
            'gpt-3.5-turbo-instruct': () => (0, GPT35Text_1.procGPT35Text)(data),
            'deepseek-chat': () => (0, DeepseekChat_1.procDeepseekChat)(data),
        }, () => {
            utils_1.SLogger.warn(`procOpenAIChat 错误 不支持的模型 data:`, data);
            return {};
        });
    }
    utils_1.SLogger.warn(`procOpenAIChat 错误 不支持的数据格式 data:`, data);
    return {};
};
exports.procOpenAIChat = procOpenAIChat;
