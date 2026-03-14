import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import { OpenAITextResponseExample } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";

export const procOpenAIInstruct = (data: OpenAITextRequest) => {
    const req = data?.prompt ?? "";
    return {
        ...OpenAITextResponseExample,
        choices: [{
            index: 0,
            text: LaMManagerMockTool.buildResp('OpenAIInstruct', req),
            finish_reason: 'stop',
            logprobs: null
        }]
    } satisfies OpenAITextResponse;
};
