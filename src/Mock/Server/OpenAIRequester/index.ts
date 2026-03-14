import type { JObject } from "@zwa73/js-utils";
import { match, SLogger, UtilFunc } from "@zwa73/utils";

import { procDeepseekChat } from "./DeepseekChat";
import { procGPT35Chat } from "./GPT35Chat";
import { procGPT35Text } from "./GPT35Text";
import { procOpenAIInstruct } from "./OpenAIInstruct";

export const procOpenAIChat = (data: JObject) => {
    if (UtilFunc.checkSharpSchema(data, {
        model: "string",
    })) {
        return match(data.model, {
            'gpt-3.5-turbo': () => procGPT35Chat(data),
            'gpt-3.5-turbo-instruct': () => procGPT35Text(data),
            'deepseek-chat': () => procDeepseekChat(data),
        }, () => {
            SLogger.warn(`procOpenAIChat 错误 不支持的模型 data:`, data);
            return {};
        });
    }
    SLogger.warn(`procOpenAIChat 错误 不支持的数据格式 data:`, data);
    return {};
};

export const procOpenAIText = (data: JObject) => {
    if (UtilFunc.checkSharpSchema(data, {
        model: "string",
    })) {
        return match(data.model, {
            'gpt-3.5-turbo-instruct': () => procOpenAIInstruct(data),
            'deepseek-code': () => procOpenAIInstruct(data),
        }, () => {
            SLogger.warn(`procOpenAIText 错误 不支持的模型 data:`, data);
            return {};
        });
    }
    SLogger.warn(`procOpenAIText 错误 不支持的数据格式 data:`, data);
    return {};
};
