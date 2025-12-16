import type { PresetOption } from '@zwa73/utils';
import type { AnyOpenAIRespFormat } from '../../ResponseFormat';
import type { Interactor } from '../Interface';
import { PostLaMOptionPreset } from '../Interface';
/**适用与 openai 鉴权方式的post工具 */
declare class _OpenAiPostTool implements Interactor<AnyOpenAIRespFormat> {
    constructor();
    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaM(partialOpt: PresetOption<typeof PostLaMOptionPreset>): Promise<import("../../ResponseFormat").DeepseekRespFormat | import("../../ResponseFormat").OpenAIConversationRespFormat | import("../../ResponseFormat").OpenAITextRespFormat | undefined>;
    /**向 openai模型 重复请求发送POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaMRepeat(partialOpt: PresetOption<typeof PostLaMOptionPreset>): Promise<import("@zwa73/utils").PromiseRetryResult<import("../../ResponseFormat").DeepseekRespFormat | import("../../ResponseFormat").OpenAIConversationRespFormat | import("../../ResponseFormat").OpenAITextRespFormat | undefined>>;
}
export declare const OpenAiPostTool: _OpenAiPostTool;
export {};
