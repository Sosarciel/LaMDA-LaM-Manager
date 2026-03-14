import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { TextCompletionResult, TextCompletionResp } from "Task/DataInterface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import type { InstructTaskOption } from "Task/Instruct/Interface";


/**DeepSeek 前缀续写格式化器 */
export const DeepseekPrefixCompletion: InstructTaskFormatter<OpenAITextRequest, OpenAITextResponse> = {
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

        if (option.suffix) {
            console.warn("Suffix is not supported in prefix completion mode");
        }

        // 前缀续写模式：使用prefix作为真实的前缀
        const finalPrompt = option.prefix || option.prompt;

        return {
            model: modelId,
            prompt: finalPrompt,
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
        if (!resp) {
            return { completed: undefined, pending: [] };
        }
        if (resp.completed) {
            return {
                completed: this.formatResp(resp.completed),
                pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
                    const result = await p;
                    return result ? this.formatResp(result) : undefined;
                }),
            };
        }
        return {
            completed: resp.completed ? this.formatResp(resp.completed) : undefined,
            pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
                const result = await p;
                return result ? this.formatResp(result) : undefined;
            }),
        };
    },

    /**格式化响应 */
    formatResp(resp: OpenAITextResponse): TextCompletionResp {
        return {
            choices: resp.choices.map((choice: any) => ({
                content: choice.text,
            })),
            vaild: true,
        };
    },
};
