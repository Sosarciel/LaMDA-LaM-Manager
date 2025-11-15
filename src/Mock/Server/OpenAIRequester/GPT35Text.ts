import { OpenAITextOption } from "RequestFormat";
import { OpenAITextRespFormat, TemplateOpenAITextResponse } from "ResponseFormat";
import { LaMManagerMock } from "Mock";





export const procGPT35Text = (data:OpenAITextOption)=>{
    const req = data?.prompt??"";
    const match = req.match(RegExp(`${LaMManagerMock.MOCK_USER}:(.+)\\n${LaMManagerMock.MOCK_CHAR}:`))!;
    const msg = match[1];
    return {
        ...TemplateOpenAITextResponse,
        choices:[{
            index:0,
            text:LaMManagerMock.buildResp('GPT35Text', msg),
            finish_reason:'stop',
            logprobs:null
        }]
    } satisfies OpenAITextRespFormat;
};