"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonFormatResp = exports.commonCalcToken = exports.stringifyCalcToken = void 0;
const Tokensizer_1 = require("../../../Tokensizer");
const Interface_1 = require("../../Interface");
/**标准的 stringify 后计算tokens的高阶函数 */
const stringifyCalcToken = (tool) => async (message, tokensizerType) => {
    const turboMessage = tool.transReq('unknow', message);
    const tokenizer = (0, Tokensizer_1.getTokensizer)(tokensizerType);
    return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
};
exports.stringifyCalcToken = stringifyCalcToken;
/**标准的计算tokens的高阶函数 */
const commonCalcToken = (tool) => async (message, tokensizerType) => {
    const turboMessage = tool.transReq('unknow', message);
    const tokenizer = (0, Tokensizer_1.getTokensizer)(tokensizerType);
    return (await tokenizer.encode(turboMessage)).length;
};
exports.commonCalcToken = commonCalcToken;
/**通用的Resp转换函数 */
const commonFormatResp = (tool) => async (resp) => {
    if (resp == null)
        return Interface_1.DefChatLaMResult;
    return {
        completed: resp.completed ? tool.formatResp(resp.completed) : undefined,
        pending: resp.pending.map(async (p) => {
            const res = await p;
            if (res == null)
                return undefined;
            return tool.formatResp(res);
        })
    };
};
exports.commonFormatResp = commonFormatResp;
