"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatTaskCtor = void 0;
const utils_1 = require("@zwa73/utils");
const Task_1 = require("../../Task");
const getMockresp = () => {
    return {
        "choices": [{
                "finish_reason": "stop",
                "index": 0,
                "logprobs": null,
                "text": `test time ${utils_1.UtilFunc.getTime()}`
            }],
        "created": 1737376418,
        "id": "cmpl-ArlGEsDLJx7IJeeCynsgqAnVju4zt",
        "model": "gpt-3.5-turbo-instruct",
        "object": "text_completion",
        "usage": { "completion_tokens": 4248, "prompt_tokens": 1849, "total_tokens": 6097 }
    };
};
const chatTaskCtor = (drive) => {
    return {
        async execute(opt) {
            const fopt = Task_1.ChatTaskOptionPreset.assign(opt);
            utils_1.SLogger.http(fopt);
            return {
                completed: Task_1.OpenAITextChatTaskFormatter.formatResp(getMockresp()),
                pending: []
            };
        },
        async countToken(messageList) {
            let ntext = "";
            for (const item of messageList.list) {
                ntext = item.type == 'desc'
                    ? `${ntext}\n${item.content}`
                    : `${ntext}\n${item.senderName}:${item.content}`;
            }
            const turboMessage = ntext.trim();
            return (await drive.encodeToken(turboMessage)).length;
        }
    };
};
exports.chatTaskCtor = chatTaskCtor;
