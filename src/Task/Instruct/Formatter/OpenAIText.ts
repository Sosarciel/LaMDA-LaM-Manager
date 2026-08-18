import type { PromiseRetryResult } from "@zwa73/js-utils";
import { lazyFunction, SLogger, UtilFunc } from "@zwa73/utils";


import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { TextCompletionResult } from "Task/DataInterface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import { tokenifyLogitBias } from "Task/Util";

import { buildFIMPrompt, validateInstructOption, commonOpenAIInstructTask } from "./Utils";

/**OpenAI Instruct 格式化器类型定义 */
type OpenAIInstructTaskFormatterType = InstructTaskFormatter<OpenAITextRequest, OpenAITextResponse>;

/**OpenAI Instruct 基础定义 */
export const OpenAIInstructBase = {
    formatResp: (resp: OpenAITextResponse) => {
        if (!UtilFunc.checkSharpSchema(resp, {
            choices: "array"
        })) {
            SLogger.warn(`OpenAIInstruct.formatResp 错误, resp不符合格式, resp: `, resp);
            return { choices: [], vaild: false };
        }

        const choices = resp.choices
            .filter(choice => choice?.text != undefined)
            .map(choice => ({ content: choice.text! }));
        return {
            choices,
            vaild: choices.length > 0
        };
    },
    async formatResult(resp: PromiseRetryResult<OpenAITextResponse | undefined> | undefined): Promise<TextCompletionResult> {
        if (!resp) {
            return { completed: undefined, pending: [] };
        }
        if (resp.completed) {
            return {
                completed: OpenAIInstructBase.formatResp(resp.completed),
                pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
                    const result = await p;
                    return result ? OpenAIInstructBase.formatResp(result) : undefined;
                }),
            };
        }
        return {
            completed: resp.completed ? OpenAIInstructBase.formatResp(resp.completed) : undefined,
            pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
                const result = await p;
                return result ? OpenAIInstructBase.formatResp(result) : undefined;
            }),
        };
    },
    async computeTokenCount(prompt: string, tokensizerType: TokensizerType): Promise<number> {
        const tokensizer = getTokensizer(tokensizerType);
        const tokens = await tokensizer.encode(prompt);
        return tokens.length;
    },
} as const satisfies Partial<OpenAIInstructTaskFormatterType>;

/**OpenAI Instruct 格式化器 */
export const OpenAIText: OpenAIInstructTaskFormatterType = {
    ...OpenAIInstructBase,

    async formatOption({ option, modelId, tokensizerType }) {
        if (!validateInstructOption(option)) {
            SLogger.warn("OpenAIInstruct formatOption 无效 option");
            return;
        }

        return {
            model: modelId,
            prompt: buildFIMPrompt(option),
            suffix: option.suffix,
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
    execute:lazyFunction(()=>commonOpenAIInstructTask(OpenAIText)),
};
