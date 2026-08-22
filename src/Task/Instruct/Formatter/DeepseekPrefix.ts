
import type { DeepseekRequest, DeepseekAPIEntry, DeepseekResponse, TokensizerType } from "@sosraciel-lamda/lam-chain";
import { DeepseekAPIRole, LaMChain, getTokensizer } from "@sosraciel-lamda/lam-chain";
import { lazyFunction, SLogger } from "@zwa73/utils";
import type { PromiseRetryResult } from "@zwa73/utils";

import type { TextCompletionResult } from "Task/DataInterface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";

import { validateInstructOption, commonOpenAIInstructTask } from "./Utils";

/**DeepSeek 前缀续写格式化器类型定义 */
type DeepseekPrefixCompletionTaskFormatterType = InstructTaskFormatter<DeepseekRequest, DeepseekResponse>;

/**DeepSeek 前缀续写格式化器 */
export const DeepseekPrefix: DeepseekPrefixCompletionTaskFormatterType = {
    formatResp: (resp: DeepseekResponse) => {
        return {
            choices: resp.choices
                .filter(choice => choice.message.content != null)
                .map(choice => ({ content: choice.message.content! })),
            vaild: true,
        };
    },

    async formatOption({ option, modelId }) {
        if (!validateInstructOption(option)) {
            SLogger.warn("DeepseekPrefixCompletion formatOption 无效 option");
            return;
        }

        if (option.suffix) {
            SLogger.warn("DeepseekPrefixCompletion 不支持 suffix 参数");
        }

        const messages: DeepseekAPIEntry[] = [];

        // 将 prompt 作为用户消息
        messages.push({
            role: DeepseekAPIRole.User,
            content: option.prompt,
        });

        // 将 prefix 作为 assistant 的前缀续写
        messages.push({
            role: DeepseekAPIRole.Assistant,
            content: option.prefix || "",
            prefix: true,
        });

        return LaMChain.stripUndefined({
            model: modelId,
            messages: messages,
            max_tokens: option.max_tokens,
            temperature: option.temperature,
            top_p: option.top_p,
            stop: option.stop,
            presence_penalty: option.presence_penalty,
            frequency_penalty: option.frequency_penalty,
        } satisfies DeepseekRequest);
    },

    async formatResult(resp: PromiseRetryResult<DeepseekResponse | undefined> | undefined): Promise<TextCompletionResult> {
        if (!resp) {
            return { completed: undefined, pending: [] };
        }
        if (resp.completed) {
            return {
                completed: this.formatResp(resp.completed),
                pending: resp.pending.map(async (p: Promise<DeepseekResponse | undefined>) => {
                    const result = await p;
                    return result ? this.formatResp(result) : undefined;
                }),
            };
        }
        return {
            completed: resp.completed ? this.formatResp(resp.completed) : undefined,
            pending: resp.pending.map(async (p: Promise<DeepseekResponse | undefined>) => {
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
    execute:lazyFunction(()=>commonOpenAIInstructTask(DeepseekPrefix)),
};
