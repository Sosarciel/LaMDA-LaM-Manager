"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepseekBetaChatTaskFormatter = void 0;
const utils_1 = require("@zwa73/utils");
const RequestFormat_1 = require("../../../RequestFormat");
const OpenAIConversation_1 = require("./OpenAIConversation");
const Utils_1 = require("./Utils");
/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message) {
    if (!message)
        return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}
/**前缀续写模式的Formater */
exports.DeepseekBetaChatTaskFormatter = {
    formatOption(opt, model) {
        //验证参数
        if (opt.messages == null) {
            utils_1.SLogger.warn("DeepseekChatOptions 无效 messages为null");
            return;
        }
        if (opt.messages.list.length == 0) {
            utils_1.SLogger.warn("DeepseekChatOptions 无效 messages长度不足");
            return;
        }
        let msg = exports.DeepseekBetaChatTaskFormatter.transReq(opt.target, opt.messages);
        msg = exports.DeepseekBetaChatTaskFormatter.formatReq(opt.target, msg);
        return {
            model: model, //模型id
            messages: msg, //提示
            max_tokens: opt.max_tokens, //最大生成令牌数
            temperature: opt.temperature, //temperature 权重控制 0为最准确 越大越偏离主题
            top_p: opt.top_p, //top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty: opt.presence_penalty, //遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty: opt.frequency_penalty, //重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop: opt.stop, //调整某token出现的概率 {"tokenid":-100~100}
        };
        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonFormatResp)(exports.DeepseekBetaChatTaskFormatter)),
    calcToken: (0, utils_1.lazyFunction)(() => (0, Utils_1.stringifyCalcToken)(exports.DeepseekBetaChatTaskFormatter)),
    transReq(chatTarget, messageList) {
        const narr = [];
        //处理主消息列表
        for (const item of messageList.list) {
            if (item.type == 'desc') {
                narr.push({
                    role: RequestFormat_1.DeepseekAPIRole.System,
                    content: item.content
                });
            }
            else {
                if (item.senderName == chatTarget) {
                    narr.push({
                        role: RequestFormat_1.DeepseekAPIRole.Assistant,
                        content: item.senderName + ":" + item.content
                    });
                }
                else {
                    narr.push({
                        role: RequestFormat_1.DeepseekAPIRole.User,
                        content: item.senderName + ":" + item.content
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
        const out = [
            ...chatList,
            {
                role: RequestFormat_1.DeepseekAPIRole.Assistant,
                content: chatTarget + ":",
                prefix: true
            }
        ];
        return out;
    },
    formatResp: OpenAIConversation_1.OpenAIConversationChatTaskFormatter.formatResp,
};
