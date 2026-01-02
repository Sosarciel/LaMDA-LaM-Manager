import type { OpenAITextRequestFormat } from "RequestFormat";
import type { OpenAITextResponseFormat } from "ResponseFormat";
import { TemplateOpenAITextResponse } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";







export const procGPT35Text = (data:OpenAITextRequestFormat)=>{
    const req = data?.prompt??"";
    const match = req.match(RegExp(`${LaMManagerMockTool.MOCK_USER}:(.+)\\n${LaMManagerMockTool.MOCK_CHAR}:`))!;
    const msg = match[1];
    return {
        ...TemplateOpenAITextResponse,
        choices:[{
            index:0,
            text:LaMManagerMockTool.buildResp('GPT35Text', msg),
            finish_reason:'stop',
            logprobs:null
        }]
    } satisfies OpenAITextResponseFormat;
};