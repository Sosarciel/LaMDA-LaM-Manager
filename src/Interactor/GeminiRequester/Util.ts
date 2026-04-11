import type { PromiseStatus } from "@zwa73/utils";
import { Failed, SLogger, Success, Terminated } from "@zwa73/utils";

import type { APIPrice, APIPriceResp, CredsData } from "CredService";
import { CredManager } from "CredService";
import type { AnyGeminiResponse, AnyGoogleErrorResponse } from "ResponseFormat";


/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
export const recordPrice = async(
    respObj: AnyGeminiResponse | undefined,
    price: APIPrice,
    accountData: CredsData,
)=>{
    if (respObj == undefined) return;
    const usageObj = respObj.usageMetadata;
    if(usageObj!=null){
        const usageResp:APIPriceResp = {
            completion_tokens:(usageObj.candidatesTokenCount??0) + (usageObj.thoughtsTokenCount??0),
            prompt_tokens    :usageObj.promptTokenCount??0,
        };
        //增加token数据
        await CredManager.computePrice(accountData,price,usageResp);
        //打印理论的当前使用量
        await CredManager.currUsedUSD(accountData);
    }else SLogger.error(`GeminiPostTool.postLaM 警告 无法计费 未找到 usage, respObj:\n${respObj}`);
    return;
};

/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const verifyResp = async (
    respObj: AnyGeminiResponse|undefined,
    accountData: CredsData
): Promise<PromiseStatus> => {
    if (respObj == undefined) return Failed;

    if(!("error" in respObj))
        return Success;

    const errorObj = respObj as AnyGoogleErrorResponse;
    const error = errorObj.error;

    SLogger.warn(`GeminiRequester.verifyResp 开始处理错误`);
    if('type' in error && error.type!=""){
        switch (error.type){
            case "new_api_error":
                if(error.code=='insufficient_user_quota'){
                    SLogger.warn("NewApi限额");
                    ////直接设置为不可用
                    //await accountData.instance.setInavailable();
                    return Terminated;
                } else if(error.code=='request_body_blocked'){
                    SLogger.warn("Jeniya请求体被阻拦(Gemini PROHIBITED_CONTENT)");
                    return Terminated;
                } else if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                    SLogger.warn("NewApi转发过载");
                    return Failed;
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
            case "upstream_error":
                if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                    SLogger.warn("转发分组过载");
                    return Failed;
                } else SLogger.error("未定义的错误子类型");
                return Terminated;
        }
    }
    switch (String(error.code)) {
        case "429":
            if (error.message.includes("当前分组上游负载已饱和，请稍后再试")) {
                SLogger.warn("转发分组过载");
                return Failed;
            }
            SLogger.warn("达到限额");
            return Terminated;
        default:
            SLogger.error("未定义的错误类型");
            return Terminated;
    }
};

