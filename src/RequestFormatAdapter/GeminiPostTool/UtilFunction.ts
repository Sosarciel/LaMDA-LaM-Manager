import { CredsData } from "@sosraciel-lamda/creds-adapter";
import { Failed, PromiseStatus, Success } from "@zwa73/utils";
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
    return Failed;
};
