import { CredsData } from "CredService";
import { Failed, PromiseStatus, SLogger, Success, Terminated } from "@zwa73/utils";
import { AnyGoogleErrorRespFormat, GeminiRespFormat } from "ResponseFormat";

/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export const verifyResp = async (
    respObj: GeminiRespFormat|undefined,
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

