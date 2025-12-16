"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procDeepseekChat = void 0;
const ResponseFormat_1 = require("../../../ResponseFormat");
const Utils_1 = require("../../Utils");
const procDeepseekChat = (data) => {
    const length = data?.messages?.length ?? 2;
    const msg = data?.messages?.[length - 2]?.content ?? "";
    return {
        ...ResponseFormat_1.TemplateDeepseekResponse,
        choices: [{
                index: 0,
                message: { role: "assistant", content: Utils_1.LaMManagerMockTool.buildResp('DeepseekChat', msg) },
                finish_reason: 'stop',
                logprobs: null
            }]
    };
};
exports.procDeepseekChat = procDeepseekChat;
