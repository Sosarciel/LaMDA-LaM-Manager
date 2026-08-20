import type { PromiseStatus } from "@zwa73/utils";
import { Failed, SLogger, Success, Terminated } from "@zwa73/utils";

import type { CredProvider } from "LaMChain";
import type { AnyOpenAILikeErrorResponse, AnyOpenAIResponse } from "ResponseFormat";



/**验证回复可用性并处理错误
 * @async
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const verifyResp = async(
    rawResp: AnyOpenAIResponse | AnyOpenAILikeErrorResponse | undefined,
    accountData: CredProvider
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
    error: AnyOpenAILikeErrorResponse['error'],
    accountData: CredProvider
): Promise<PromiseStatus> => {

    if(error.message=="We were unable to start processing your request within the 900-second timeout limit. Please try again later."){
        SLogger.warn("Deepseek请求处理超时");
        return Failed;
    }

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
                await accountData.setInavailable?.();
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
                await accountData.setInavailable?.();
                return Terminated;
            } else if (error.code == "account_deactivated") {
                //直接设置为不可用
                SLogger.fatal("账号被停用");
                await accountData.setInavailable?.();
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
                await accountData.setInavailable?.();
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
        case "upstream_error":
            if(error.code=='bad_response_status_code'){
                SLogger.warn("Cloudflare网关超时");
                return Failed;
            } else if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                SLogger.warn("转发分组过载");
                return Failed;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "new_api_error":
            if(error.code=='insufficient_user_quota'){
                SLogger.warn("NewApi限额");
                ////直接设置为不可用
                //await accountData.instance.setInavailable();
                return Terminated;
            } else if(error.code=='request_body_blocked'){
                SLogger.warn("Jeniya请求体被阻拦(Gemini PROHIBITED_CONTENT)");
                return Terminated;
            } else if ( error.message.includes("当前分组上游负载已饱和") ||
                        error.message.includes("upstream load is saturated")) {
                SLogger.warn("NewApi转发过载");
                return Failed;
            } else if(error.code=='model_not_found'){
                SLogger.warn("NewApi模型未找到");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "v_api_error":
            if(error.code=='prompt_blocked'){
                SLogger.warn("VApi提示词被阻拦");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "v_api_biz_error":
            if(error.code=='prompt_blocked'){
                SLogger.warn("VApi业务错误 提示词被阻拦(Gemini PROHIBITED_CONTENT)");
                return Terminated;
            } else SLogger.error("未定义的错误子类型");
            return Terminated;
        case "one_api_error":
            if(error.code=='do_request_failed'){
                SLogger.warn("OneApi转发请求错误");
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
            SLogger.error("未定义的错误类型");
            return Terminated;
    }
};
