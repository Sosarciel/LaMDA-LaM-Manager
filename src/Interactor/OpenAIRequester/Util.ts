import type { PromiseStatus } from "@zwa73/utils";
import { Failed, SLogger, Success, Terminated } from "@zwa73/utils";

import type { APIPrice, APIPriceResp, CredsData } from "CredService";
import { CredManager } from "CredService";
import type { AnyOpenAIRespFormat, OpenAIErrorFormat } from "ResponseFormat";



/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
export const recordPrice = async(
    respObj: AnyOpenAIRespFormat | undefined,
    price: APIPrice,
    accountData: CredsData,
)=>{
    if (respObj == undefined) return;
    const usageObj = respObj.usage;

    if(usageObj == undefined)
        return void SLogger.error(`OpenAILaMClient.postLaM 警告 无法计费 未找到 usage, respObj:\n`,respObj);

    const usageResp:APIPriceResp = {
        completion_tokens :usageObj.completion_tokens??0,
        prompt_tokens     :usageObj.prompt_tokens??0,
    };

    if('prompt_cache_hit_tokens' in usageObj)
    usageResp.prompt_cache_hit_tokens = usageObj.prompt_cache_hit_tokens;
    if('prompt_cache_miss_tokens' in usageObj)
    usageResp.prompt_cache_miss_tokens = usageObj.prompt_cache_miss_tokens;

    //增加token数据
    await CredManager.calcPrice(accountData,price,usageResp);
    //打印理论的当前使用量
    await CredManager.currUsedUSD(accountData);
    return;
};

/**验证回复可用性并处理错误
 * @async
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const verifyResp = async(
    rawResp: AnyOpenAIRespFormat | OpenAIErrorFormat | undefined,
    accountData: CredsData
): Promise<PromiseStatus> => {
    if (rawResp == undefined) return Failed;

    if('error' in rawResp){
        SLogger.warn(`verifyResp 开始处理错误:\n${JSON.stringify(rawResp)}`);
        return checkError(rawResp.error, accountData);
    }
    return Success;

};

/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const checkError = async (
    error: OpenAIErrorFormat['error'],
    accountData: CredsData
): Promise<PromiseStatus> => {

    switch (error.type) {
        case "server_error":
            SLogger.warn("服务器错误");
            if (error.message.includes("overloaded with other requests")) {
                SLogger.warn("模型过载");
                return Failed;
            } else if (error.message.includes("error while processing your request")) {
                SLogger.warn("服务器处理出错 1");
                return Failed;
            } else if (error.message.includes("The server had an error processing your request")) {
                SLogger.warn("服务器处理出错 2");
                return Failed;
            } else if (error.code === "invalid_model_output") {
                SLogger.warn("模型输出错误");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "auth_subrequest_error":
            SLogger.warn("授权错误");
            if (error.code == "internal_error") {
                SLogger.warn("OpenAI 内部服务器错误");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "insufficient_quota":
            SLogger.warn("限额错误");
            if (error.message.includes("current quota")) {
                SLogger.warn("用量达到限额");
                //直接设置为不可用
                await accountData.instance.setInavailable();
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "tokens":
            SLogger.warn("速率限额");
            if (error.message.includes("Rate limit")) {
                SLogger.warn("达到速率限额");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "invalid_request_error":
            SLogger.warn("无效请求错误");
            if (error.code == "invalid_api_key") {
                //直接设置为不可用
                SLogger.warn("无效的API_KEY");
                await accountData.instance.setInavailable();
                return Terminated;
            } else if (error.code == "account_deactivated") {
                //直接设置为不可用
                SLogger.fatal("账号被停用");
                await accountData.instance.setInavailable();
                return Terminated;
            } else if (error.message.includes("currently overloaded with other requests")) {
                SLogger.warn("模型过载");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "access_terminated":
            SLogger.warn("拒绝访问错误");
            if (error.message.includes("access was terminated")) {
                //直接设置为不可用
                SLogger.fatal("违反规则终止访问");
                //直接设置为不可用
                await accountData.instance.setInavailable();
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "cf_service_unavailable":
            SLogger.warn("cf服务器错误");
            if (error.message == "Service Unavailable.") {
                SLogger.warn("服务器错误");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "requests":
            if (error.message.includes("Rate limit reached")) {
                SLogger.warn("达到速率限额");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "new_api_error":
            if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                SLogger.warn("转发API过载");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "v_api_error":
            if(error.code=='prompt_blocked'){
                SLogger.warn("提示词被阻拦");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "upstream_error":
            if(error.code=='bad_response_status_code'){
                SLogger.warn("Cloudflare网关超时");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "one_api_error":
            if(error.code=='do_request_failed'){
                SLogger.warn("请求转发错误");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "":
            if (error.message.includes("The response was filtered due to the prompt triggering Azure OpenAI's content management policy")) {
                SLogger.warn("内容过滤");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        default:
            const e: any = error;
            SLogger.error("未定义的错误类型");
            return Terminated;
    }
};
