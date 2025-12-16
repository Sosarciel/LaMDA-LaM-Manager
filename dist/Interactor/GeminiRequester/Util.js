"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResp = exports.recordPrice = void 0;
const utils_1 = require("@zwa73/utils");
const CredService_1 = require("../../CredService");
/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
const recordPrice = async (respObj, price, accountData) => {
    if (respObj == undefined)
        return;
    const usageObj = respObj.usageMetadata;
    if (usageObj != null) {
        const usageResp = {
            completion_tokens: (usageObj.candidatesTokenCount ?? 0) + (usageObj.thoughtsTokenCount ?? 0),
            prompt_tokens: usageObj.promptTokenCount ?? 0,
        };
        //增加token数据
        await CredService_1.CredManager.calcPrice(accountData, price, usageResp);
        //打印理论的当前使用量
        await CredService_1.CredManager.currUsedUSD(accountData);
    }
    else
        utils_1.SLogger.error(`GeminiPostTool.postLaM 警告 无法计费 未找到 usage, respObj:\n${respObj}`);
    return;
};
exports.recordPrice = recordPrice;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
const verifyResp = async (respObj, accountData) => {
    if (respObj == undefined)
        return utils_1.Failed;
    if (!("error" in respObj))
        return utils_1.Success;
    const errorObj = respObj.error;
    const error = errorObj.error;
    utils_1.SLogger.warn(`GeminiRequester.verifyResp 开始处理错误`);
    switch (error.code) {
        case 429:
            utils_1.SLogger.warn("达到限额");
            return utils_1.Terminated;
        default:
            utils_1.SLogger.error("未定义的错误类型");
            return utils_1.Terminated;
    }
};
exports.verifyResp = verifyResp;
