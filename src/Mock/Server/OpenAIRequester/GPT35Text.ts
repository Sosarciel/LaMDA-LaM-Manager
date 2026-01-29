import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";
import { OpenAITextResponseExample } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";







export const procGPT35Text = (data:OpenAITextRequest)=>{
    const req = data?.prompt??"";
    const match = req.match(RegExp(`${LaMManagerMockTool.MOCK_USER}:(.+)\\n${LaMManagerMockTool.MOCK_CHAR}:`))!;
    const msg = match[1];
    return {
        ...OpenAITextResponseExample,
        choices:[{
            index:0,
            text:LaMManagerMockTool.buildResp('GPT35Text', msg),
            finish_reason:'stop',
            logprobs:null
        }]
    } satisfies OpenAITextResponse;
};