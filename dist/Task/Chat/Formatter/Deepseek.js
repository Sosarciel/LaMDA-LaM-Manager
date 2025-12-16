"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepseekChatTaskFormatter = void 0;
const utils_1 = require("@zwa73/utils");
const OpenAIConversation_1 = require("./OpenAIConversation");
const Utils_1 = require("./Utils");
/**传统OpenAI系统提示模式的Formater */
exports.DeepseekChatTaskFormatter = {
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
        let msg = exports.DeepseekChatTaskFormatter.transReq(opt.target, opt.messages);
        msg = exports.DeepseekChatTaskFormatter.formatReq(opt.target, msg);
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
    formatResult: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonFormatResp)(exports.DeepseekChatTaskFormatter)),
    calcToken: (0, utils_1.lazyFunction)(() => (0, Utils_1.stringifyCalcToken)(exports.DeepseekChatTaskFormatter)),
    transReq: OpenAIConversation_1.OpenAIConversationChatTaskFormatter.transReq,
    formatReq: OpenAIConversation_1.OpenAIConversationChatTaskFormatter.formatReq,
    formatResp: OpenAIConversation_1.OpenAIConversationChatTaskFormatter.formatResp,
};
