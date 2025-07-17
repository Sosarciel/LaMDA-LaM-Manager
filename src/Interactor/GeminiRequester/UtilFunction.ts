import { CredsData } from "@sosraciel-lamda/creds-manager";
import { Failed, PromiseStatus, SLogger, Success, Terminated } from "@zwa73/utils";
import { AnyGoogleErrorRespFormat } from "ResponseFormat";
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
    error: AnyGoogleErrorRespFormat['error'],
    accountData: CredsData
): Promise<PromiseStatus> => {
    switch (error.code) {
        case 429:
            SLogger.warn("达到限额");
            return Terminated;
        default:
            SLogger.error("未定义的错误类型");
            return Terminated;
    }
};