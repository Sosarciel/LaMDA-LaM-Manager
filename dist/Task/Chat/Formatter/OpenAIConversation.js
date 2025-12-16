"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIConversationChatTaskFormatter = void 0;
const utils_1 = require("@zwa73/utils");
const RequestFormat_1 = require("../../../RequestFormat");
const Utils_1 = require("./Utils");
exports.OpenAIConversationChatTaskFormatter = {
    formatOption(opt, model) {
        //验证参数
        if (opt.messages == null) {
            utils_1.SLogger.warn("TurboOptions 无效 messages为null");
            return;
        }
        if (opt.messages.list.length == 0) {
            utils_1.SLogger.warn("TurboOptions 无效 messages长度不足");
            return;
        }
        let turboMessahge = exports.OpenAIConversationChatTaskFormatter.transReq(opt.target, opt.messages);
        turboMessahge = exports.OpenAIConversationChatTaskFormatter.formatReq(opt.target, turboMessahge);
        return {
            model: model, //模型id
            messages: turboMessahge, //提示
            max_tokens: opt.max_tokens, //最大生成令牌数
            temperature: opt.temperature, //temperature 权重控制 0为最准确 越大越偏离主题
            top_p: opt.top_p, //top_p       权重控制 0为最准确 越大越偏离主题
            n: opt.n, //产生n条消息
            presence_penalty: opt.presence_penalty, //遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty: opt.frequency_penalty, //重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            logit_bias: opt.logit_bias, //重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            //best_of         : best_of                 ,//产生n条候选消息，根据n返回n条最佳消息
            stop: opt.stop, //调整某token出现的概率 {"tokenid":-100~100}
        };
        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonFormatResp)(exports.OpenAIConversationChatTaskFormatter)),
    calcToken: (0, utils_1.lazyFunction)(() => (0, Utils_1.stringifyCalcToken)(exports.OpenAIConversationChatTaskFormatter)),
    transReq(chatTarget, messageList) {
        const narr = [];
        //处理主消息列表
        for (const item of messageList.list) {
            if (item.type == 'desc') {
                narr.push({
                    role: RequestFormat_1.OpenAIConversationAPIRole.System,
                    content: item.content
                });
            }
            else {
                narr.push({
                    role: RequestFormat_1.OpenAIConversationAPIRole.System,
                    content: item.senderName + ":"
                });
                if (item.senderName == chatTarget) {
                    narr.push({
                        role: RequestFormat_1.OpenAIConversationAPIRole.Assistant,
                        content: item.content
                    });
                }
                else {
                    narr.push({
                        role: RequestFormat_1.OpenAIConversationAPIRole.User,
                        content: item.content
                    });
                }
            }
        }
        //处理临时提示
        if (messageList.tempPrompt != null && messageList.tempPrompt.length > 0)
            narr[narr.length - 1].content += messageList.tempPrompt;
        return narr;
    },
    formatReq(chatTarget, chatList) {
        chatList.push({
            role: RequestFormat_1.OpenAIConversationAPIRole.System,
            content: `${chatTarget}:`,
        });
        return chatList;
    },
    formatResp: (resp) => {
        if (!utils_1.UtilFunc.checkSharpSchema(resp, {
            choices: "array"
        })) {
            utils_1.SLogger.warn(`OpenAIConversationChatTaskFormatter.formatResp 错误, resp不符合格式, resp: `, resp);
            return { choices: [], vaild: false };
        }
        const choices = resp.choices
            .filter(choice => choice?.message?.content != undefined)
            .map(choice => ({ content: choice.message.content }));
        return {
            choices,
            vaild: choices.length > 0
        };
    }
};
