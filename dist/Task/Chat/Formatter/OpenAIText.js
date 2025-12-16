"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAITextChatTaskFormatter = void 0;
const utils_1 = require("@zwa73/utils");
const Utils_1 = require("./Utils");
exports.OpenAITextChatTaskFormatter = {
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
        //转换文本
        let turboMessahge = exports.OpenAITextChatTaskFormatter.transReq(opt.target, opt.messages);
        turboMessahge = exports.OpenAITextChatTaskFormatter.formatReq(opt.target, turboMessahge);
        return {
            model: model, //模型id
            prompt: turboMessahge, //提示
            max_tokens: opt.max_tokens, //最大生成令牌数
            temperature: opt.temperature, //temperature 权重控制 0为最准确 越大越偏离主题
            top_p: opt.top_p, //top_p       权重控制 0为最准确 越大越偏离主题
            n: opt.n, //产生n条消息
            presence_penalty: opt.presence_penalty, //重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty: opt.frequency_penalty, //重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            logit_bias: opt.logit_bias, //调整某token出现的概率 {"tokenid":-100~100}
            //best_of         : best_of                  ,//产生n条候选消息，根据n返回n条最佳消息
            stop: opt.stop, //遭遇时将会停止生成的最多4个字符串 "1234"
        };
        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonFormatResp)(exports.OpenAITextChatTaskFormatter)),
    calcToken: (0, utils_1.lazyFunction)(() => (0, Utils_1.commonCalcToken)(exports.OpenAITextChatTaskFormatter)),
    transReq(chatTarget, messageList) {
        let ntext = "";
        //处理主消息列表
        for (const item of messageList.list) {
            ntext = item.type == 'desc'
                ? `${ntext}\n${item.content}`
                : `${ntext}\n${item.senderName}:${item.content}`;
        }
        //处理临时提示
        if (messageList.tempPrompt != null && messageList.tempPrompt.length > 0)
            ntext += messageList.tempPrompt;
        return ntext.trim();
    },
    formatReq(chatTarget, chatText) {
        return `${chatText}\n${chatTarget}:`;
    },
    formatResp: (resp) => {
        // 提取 choices 列表
        const choices = resp.choices
            .filter(choice => choice?.text != undefined)
            .map(choice => ({ content: choice.text }));
        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};
//void (async ()=>{
//    console.log(await OpenAITextChatFormater.calcToken(new LaMChatMessages({
//        type:MessageType.DESC,
//        content:"你好，我的民资是"
//    }),"deepseek"))
//})();
