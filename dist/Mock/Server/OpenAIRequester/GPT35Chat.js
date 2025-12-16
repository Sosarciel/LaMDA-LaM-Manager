"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procGPT35Chat = void 0;
const ResponseFormat_1 = require("../../../ResponseFormat");
const Utils_1 = require("../../Utils");
const procGPT35Chat = (data) => {
    const length = data?.messages?.length ?? 2;
    const msg = data?.messages?.[length - 2]?.content ?? "";
    return {
        ...ResponseFormat_1.TemplateOpenAIConversationResponse,
        choices: [{
                index: 0,
                message: { role: "assistant", content: Utils_1.LaMManagerMockTool.buildResp('GPT35Chat', msg) },
                finish_reason: 'stop'
            }]
    };
};
exports.procGPT35Chat = procGPT35Chat;
