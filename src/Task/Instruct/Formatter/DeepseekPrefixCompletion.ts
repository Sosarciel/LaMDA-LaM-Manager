import type { PromiseRetryResult } from "@zwa73/js-utils";
import { SLogger } from "@zwa73/utils";

import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { TextCompletionResult } from "Task/DataInterface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import { tokenifyLogitBias } from "Task/Util";

import { validateInstructOption } from "./Utils";

/**DeepSeek 前缀续写格式化器类型定义 */
type DeepseekPrefixCompletionTaskFormatterType = InstructTaskFormatter<OpenAITextRequest, OpenAITextResponse>;

/**DeepSeek 前缀续写格式化器 */
export const DeepseekPrefixCompletion: DeepseekPrefixCompletionTaskFormatterType = {
    formatResp: (resp: OpenAITextResponse) => {
        return {
            choices: resp.choices.map(choice => ({
                content: choice.text,
            })),
            vaild: true,
        };
    },

    async formatOption({ option, modelId, tokensizerType }) {
        if (!validateInstructOption(option)) {
            SLogger.warn("DeepseekPrefixCompletion formatOption 无效 option");
            return;
        }

        if (option.suffix) {
            SLogger.warn("DeepseekPrefixCompletion 不支持 suffix 参数");
        }

        // 前缀续写模式：prefix 作为真实的前缀，prompt 作为前缀之前的提示
        // 如果提供了 prefix，使用 prefix 作为 prompt；否则使用 prompt
        const finalPrompt = option.prefix !== undefined ? option.prefix : option.prompt;

        return {
            model: modelId,
            prompt: finalPrompt,
            max_tokens: option.max_tokens,
            temperature: option.temperature,
            top_p: option.top_p,
            n: option.n,
            stop: option.stop,
            logprobs: option.logprobs,
            echo: option.echo,
            presence_penalty: option.presence_penalty,
            frequency_penalty: option.frequency_penalty,
            logit_bias: await tokenifyLogitBias(option.logit_bias, tokensizerType),
        } satisfies OpenAITextRequest;
    },

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

    async computeTokenCount(prompt: string, tokensizerType: TokensizerType): Promise<number> {
        const tokensizer = getTokensizer(tokensizerType);
        const tokens = await tokensizer.encode(prompt);
        return tokens.length;
    },
};
