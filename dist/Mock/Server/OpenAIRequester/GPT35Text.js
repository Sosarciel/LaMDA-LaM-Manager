"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procGPT35Text = void 0;
const ResponseFormat_1 = require("../../../ResponseFormat");
const Utils_1 = require("../../Utils");
const procGPT35Text = (data) => {
    const req = data?.prompt ?? "";
    const match = req.match(RegExp(`${Utils_1.LaMManagerMockTool.MOCK_USER}:(.+)\\n${Utils_1.LaMManagerMockTool.MOCK_CHAR}:`));
    const msg = match[1];
    return {
        ...ResponseFormat_1.TemplateOpenAITextResponse,
        choices: [{
                index: 0,
                text: Utils_1.LaMManagerMockTool.buildResp('GPT35Text', msg),
                finish_reason: 'stop',
                logprobs: null
            }]
    };
};
exports.procGPT35Text = procGPT35Text;
