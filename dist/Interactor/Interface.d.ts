import type { PresetOption, PromiseRetries, PromiseRetryResult } from "@zwa73/utils";
import type { CredsData } from "../CredService";
import type { AnyLaMOption } from "../LaMService";
import type { HttpApiModelCategory } from "../ModelDrive";
import type { AnyTextCompletionRespFormat } from "../ResponseFormat";
/**请求格式化工具 */
export type Interactor<FMT extends AnyTextCompletionRespFormat = AnyTextCompletionRespFormat> = {
    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaM(partialOpt: PresetOption<typeof PostLaMOptionPreset>): Promise<FMT | undefined>;
    /**向 openai模型 重复请求发送POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaMRepeat(partialOpt: PresetOption<typeof PostLaMOptionPreset>): Promise<PromiseRetryResult<FMT | undefined>>;
};
/**PostLaM参数 */
export type PostLaMOption = {
    /**传入的参数对象 */
    postJson: AnyLaMOption;
    /**账户数据 */
    accountData: CredsData;
    /**api价格 */
    modelData: HttpApiModelCategory;
    /**单个超时时间/毫秒 最小为10000毫秒 -1为不存在 */
    timeLimit: number;
    /**重试选项 */
    retryOption: PromiseRetries;
};
/**默认的聊天设置 */
export declare const PostLaMOptionPreset: import("@zwa73/utils").Preset<PostLaMOption, {
    timeLimit: number;
    retryOption: {
        count: number;
        tryInterval: number;
        tryDelay: number;
    };
}>;
