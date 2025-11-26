import type { APIPrice, APIPriceResp, CredsData } from "CredService";
import { CredManager } from "CredService";
import type { PromiseStatus } from "@zwa73/utils";
import { Failed, SLogger, Success, Terminated } from "@zwa73/utils";
import type { AnyGeminiRespFormat, AnyGoogleErrorRespFormat } from "ResponseFormat";


/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
export const recordPrice = async(
    respObj: AnyGeminiRespFormat | undefined,
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
        await CredManager.calcPrice(accountData,price,usageResp);
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
    respObj: AnyGeminiRespFormat|undefined,
    accountData: CredsData
): Promise<PromiseStatus> => {
    if (respObj == undefined) return Failed;

    if(!("error" in respObj))
        return Success;

    const errorObj = respObj.error as AnyGoogleErrorRespFormat;
    const error = errorObj.error;

    SLogger.warn(`GeminiRequester.verifyResp 开始处理错误`);
    switch (error.code) {
        case 429:
            SLogger.warn("达到限额");
            return Terminated;
        default:
            SLogger.error("未定义的错误类型");
            return Terminated;
    }
};

