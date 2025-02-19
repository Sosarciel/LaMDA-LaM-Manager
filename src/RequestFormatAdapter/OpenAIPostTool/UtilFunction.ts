import { Failed, PromiseStatus, SLogger, Success, Terminated } from "@zwa73/utils";
import { AnyOpenAIErrorFormat } from "@/TextCompletion/OpenAI/Resp";
import { CredsData } from "@sosraciel-lamda/creds-adapter";

/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const verifyResp = async <T>(
    rawResp: T | undefined,
    accountData: CredsData
): Promise<PromiseStatus> => {
    if (rawResp == null) return Failed;

    const error = (rawResp as any).error;
    if (error == null) return Success;

    SLogger.warn(`verifyResp 开始处理错误:\n${JSON.stringify(rawResp)}`);
    return checkError(error, accountData);
};


/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const checkError = async (
    error: AnyOpenAIErrorFormat['error'],
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
