import { LaMChain } from "@sosraciel-lamda/lam-chain";
import type { DeepseekTextRequest, DeepseekTextResponse } from "@sosraciel-lamda/lam-chain";
import { lazyFunction, SLogger } from "@zwa73/utils";

import type { InstructTaskFormatter } from "Task/Instruct/Adapter";

import { OpenAIInstructBase } from "./OpenAIText";
import { buildFIMPrompt, validateInstructOption, commonOpenAIInstructTask } from "./Utils";

/**DeepSeek FIM 格式化器类型定义 */
type DeepseekFIMTaskFormatterType = InstructTaskFormatter<DeepseekTextRequest, DeepseekTextResponse>;

/**DeepSeek FIM 格式化器 */
export const DeepseekText: DeepseekFIMTaskFormatterType = {
    ...OpenAIInstructBase,

    async formatOption({ option, modelId, tokensizerType }) {
        if (!validateInstructOption(option)) {
            SLogger.warn("DeepseekFIM formatOption 无效 option");
            return;
        }

        return LaMChain.stripUndefined({
            model: modelId,
            prompt: buildFIMPrompt(option),
            suffix: option.suffix,
            max_tokens: option.max_tokens,
            temperature: option.temperature,
            top_p: option.top_p,
            stop: option.stop,
            logprobs: option.logprobs,
            echo: option.echo,
            presence_penalty: option.presence_penalty,
            frequency_penalty: option.frequency_penalty,
            //logit_bias: await LaMChain.tokenifyLogitBias({textLogitBias:option.logit_bias, tokensizerType}),
        } satisfies DeepseekTextRequest);
    },
    execute:lazyFunction(()=>commonOpenAIInstructTask(DeepseekText)),
};
