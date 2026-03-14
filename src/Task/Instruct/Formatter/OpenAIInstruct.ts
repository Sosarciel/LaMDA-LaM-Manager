import type { PromiseRetryResult } from '@zwa73/js-utils';

import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { TextCompletionResult, TextCompletionResp } from "Task/DataInterface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import type { InstructTaskOption } from "Task/Instruct/Interface";

import { commonFormatResp, commonFormatResult } from "./Utils";

/**OpenAI Instruct 格式化器 */
export const OpenAIInstruct: InstructTaskFormatter<OpenAITextRequest, OpenAITextResponse> = {
    /**计算Token数量 */
    async computeTokenCount(prompt: string, tokensizerType: TokensizerType): Promise<number> {
        const tokensizer = getTokensizer(tokensizerType);
        const tokens = await tokensizer.encode(prompt);
        return tokens.length;
    },

    /**格式化选项 */
    async formatOption(arg: {
        option: InstructTaskOption;
        modelId: string;
        tokensizerType: TokensizerType;
    }): Promise<OpenAITextRequest | undefined> {
        const { option, modelId } = arg;

        return {
            model: modelId,
            prompt: option.prompt,
            suffix: option.suffix,
            max_tokens: option.max_tokens,
            temperature: option.temperature,
            top_p: option.top_p,
            n: option.n,
            stop: option.stop || option.stop === null ? option.stop : undefined,
            logprobs: option.logprobs,
            echo: option.echo,
            presence_penalty: option.presence_penalty,
            frequency_penalty: option.frequency_penalty,
            logit_bias: typeof option.logit_bias === 'object' && !Array.isArray(option.logit_bias) ? option.logit_bias : undefined,
        };
    },

    /**格式化结果 */
    async formatResult(resp: PromiseRetryResult<OpenAITextResponse | undefined> | undefined): Promise<TextCompletionResult> {
        return commonFormatResult(resp, this.formatResp);
    },

    /**格式化响应 */
    formatResp(resp: OpenAITextResponse): TextCompletionResp {
        return commonFormatResp(resp);
    },
};
