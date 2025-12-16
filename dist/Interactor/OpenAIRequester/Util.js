"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkError = exports.verifyResp = exports.recordPrice = void 0;
const utils_1 = require("@zwa73/utils");
const CredService_1 = require("../../CredService");
/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
const recordPrice = async (respObj, price, accountData) => {
    if (respObj == undefined)
        return;
    const usageObj = respObj.usage;
    if (usageObj == undefined)
        return void utils_1.SLogger.error(`OpenAILaMClient.postLaM 警告 无法计费 未找到 usage, respObj:\n`, respObj);
    const usageResp = {
        completion_tokens: usageObj.completion_tokens ?? 0,
        prompt_tokens: usageObj.prompt_tokens ?? 0,
    };
    if ('prompt_cache_hit_tokens' in usageObj)
        usageResp.prompt_cache_hit_tokens = usageObj.prompt_cache_hit_tokens;
    if ('prompt_cache_miss_tokens' in usageObj)
        usageResp.prompt_cache_miss_tokens = usageObj.prompt_cache_miss_tokens;
    //增加token数据
    await CredService_1.CredManager.calcPrice(accountData, price, usageResp);
    //打印理论的当前使用量
    await CredService_1.CredManager.currUsedUSD(accountData);
    return;
};
exports.recordPrice = recordPrice;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
const verifyResp = async (rawResp, accountData) => {
    if (rawResp == undefined)
        return utils_1.Failed;
    if ('error' in rawResp) {
        utils_1.SLogger.warn(`verifyResp 开始处理错误:\n${JSON.stringify(rawResp)}`);
        return (0, exports.checkError)(rawResp.error, accountData);
    }
    return utils_1.Success;
};
exports.verifyResp = verifyResp;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
const checkError = async (error, accountData) => {
    switch (error.type) {
        case "server_error":
            utils_1.SLogger.warn("服务器错误");
            if (error.message.includes("overloaded with other requests")) {
                utils_1.SLogger.warn("模型过载");
                return utils_1.Failed;
            }
            else if (error.message.includes("error while processing your request")) {
                utils_1.SLogger.warn("服务器处理出错 1");
                return utils_1.Failed;
            }
            else if (error.message.includes("The server had an error processing your request")) {
                utils_1.SLogger.warn("服务器处理出错 2");
                return utils_1.Failed;
            }
            else if (error.code === "invalid_model_output") {
                utils_1.SLogger.warn("模型输出错误");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "auth_subrequest_error":
            utils_1.SLogger.warn("授权错误");
            if (error.code == "internal_error") {
                utils_1.SLogger.warn("OpenAI 内部服务器错误");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "insufficient_quota":
            utils_1.SLogger.warn("限额错误");
            if (error.message.includes("current quota")) {
                utils_1.SLogger.warn("用量达到限额");
                //直接设置为不可用
                await accountData.instance.setInavailable();
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "tokens":
            utils_1.SLogger.warn("速率限额");
            if (error.message.includes("Rate limit")) {
                utils_1.SLogger.warn("达到速率限额");
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "invalid_request_error":
            utils_1.SLogger.warn("无效请求错误");
            if (error.code == "invalid_api_key") {
                //直接设置为不可用
                utils_1.SLogger.warn("无效的API_KEY");
                await accountData.instance.setInavailable();
                return utils_1.Terminated;
            }
            else if (error.code == "account_deactivated") {
                //直接设置为不可用
                utils_1.SLogger.fatal("账号被停用");
                await accountData.instance.setInavailable();
                return utils_1.Terminated;
            }
            else if (error.message.includes("currently overloaded with other requests")) {
                utils_1.SLogger.warn("模型过载");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "access_terminated":
            utils_1.SLogger.warn("拒绝访问错误");
            if (error.message.includes("access was terminated")) {
                //直接设置为不可用
                utils_1.SLogger.fatal("违反规则终止访问");
                //直接设置为不可用
                await accountData.instance.setInavailable();
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "cf_service_unavailable":
            utils_1.SLogger.warn("cf服务器错误");
            if (error.message == "Service Unavailable.") {
                utils_1.SLogger.warn("服务器错误");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "requests":
            if (error.message.includes("Rate limit reached")) {
                utils_1.SLogger.warn("达到速率限额");
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "upstream_error":
            if (error.code == 'bad_response_status_code') {
                utils_1.SLogger.warn("Cloudflare网关超时");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "new_api_error":
            if (error.code == 'insufficient_user_quota') {
                utils_1.SLogger.warn("NewApi限额");
                //直接设置为不可用
                await accountData.instance.setInavailable();
                return utils_1.Terminated;
            }
            else if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                utils_1.SLogger.warn("NewApi转发过载");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "v_api_error":
            if (error.code == 'prompt_blocked') {
                utils_1.SLogger.warn("VApi提示词被阻拦");
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "one_api_error":
            if (error.code == 'do_request_failed') {
                utils_1.SLogger.warn("OneApi转发请求错误");
                return utils_1.Failed;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        case "":
            if (error.message.includes("The response was filtered due to the prompt triggering Azure OpenAI's content management policy")) {
                utils_1.SLogger.warn("内容过滤");
                return utils_1.Terminated;
            }
            else
                utils_1.SLogger.error("未定义的错误子类型");
            return utils_1.Terminated;
        default:
            const e = error;
            utils_1.SLogger.error("未定义的错误类型");
            return utils_1.Terminated;
    }
};
exports.checkError = checkError;
