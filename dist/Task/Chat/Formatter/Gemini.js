"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiChatTaskFormatter = void 0;
const utils_1 = require("@zwa73/utils");
const RequestFormat_1 = require("../../../RequestFormat");
const Utils_1 = require("./Utils");
exports.GeminiChatTaskFormatter = {
    formatOption(opt, model) {
        //验证参数
        if (opt.messages == null) {
            utils_1.SLogger.warn("GoogleChatOption 无效 messages为null");
            return;
        }
        if (opt.messages.list.length == 0) {
            utils_1.SLogger.warn("GoogleChatOption 无效 messages长度不足");
            return;
        }
        //gemini-3-pro在hist超过一定长度后think_budget参数在无额外提示的情况下会被忽略
        const fxmsg = { ...opt.messages };
        if (opt.think_budget != undefined && /gemini-3-pro/.test(model))
            fxmsg.tempPrompt = `(think of reason tokens briefly no more than ${opt.think_budget} words)${fxmsg.tempPrompt ?? ''}`;
        let turboMessahge = exports.GeminiChatTaskFormatter.transReq(opt.target, fxmsg);
        turboMessahge = exports.GeminiChatTaskFormatter.formatReq(opt.target, turboMessahge);
        return {
            system_instruction: { parts: { text: turboMessahge.define } },
            contents: turboMessahge.message,
            generationConfig: {
                stopSequences: opt.stop ?? undefined,
                temperature: opt.temperature ?? undefined,
                maxOutputTokens: opt.max_tokens ?? undefined,
                topP: opt.top_p ?? undefined,
                thinkingBudget: opt.think_budget ?? undefined,
            }
        };
    },
    calcToken: (0, utils_1.lazyFunction)(() => (0, Utils_1.stringifyCalcToken)(exports.GeminiChatTaskFormatter)),
    formatResult: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonFormatResp)(exports.GeminiChatTaskFormatter)),
    transReq(chatTarget, messageList) {
        let desc = "";
        let inDesc = true;
        const narr = [];
        //处理主消息列表
        for (const item of messageList.list) {
            if (item.type == 'desc') {
                //头部说明直接合并
                if (inDesc) {
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else {
                    narr.push({
                        role: RequestFormat_1.GeminiAPIRole.User,
                        parts: [{ text: item.content }]
                    });
                }
            }
            else {
                inDesc = false;
                narr.push({
                    role: RequestFormat_1.GeminiAPIRole.User,
                    parts: [{ text: item.senderName + ":" }]
                });
                if (item.senderName == chatTarget) {
                    narr.push({
                        role: RequestFormat_1.GeminiAPIRole.Model,
                        parts: [{ text: item.content }]
                    });
                }
                else {
                    narr.push({
                        role: RequestFormat_1.GeminiAPIRole.User,
                        parts: [{ text: item.content }]
                    });
                }
            }
        }
        //处理临时提示
        if (messageList.tempPrompt != null && messageList.tempPrompt.length > 0)
            narr[narr.length - 1].parts[0].text += messageList.tempPrompt;
        return {
            message: narr,
            define: desc.trim(),
        };
    },
    formatReq(chatTarget, chatList) {
        chatList.message.push({
            role: RequestFormat_1.GeminiAPIRole.User,
            parts: [{ text: `${chatTarget}:` }],
        });
        return chatList;
    },
    formatResp: (resp) => {
        const choices = resp.candidates
            .filter(choice => choice?.content?.parts?.[0]?.text != undefined)
            .map(choice => ({ content: choice.content.parts[0].text }));
        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};
