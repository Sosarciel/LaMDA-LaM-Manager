import { OpenAITextOption } from "RequestFormat";
import { OpenAITextRespFormat, TemplateOpenAITextResponse } from "ResponseFormat";
import { buildResp } from "../../Utils";
import { MOCK_CHAR, MOCK_USER } from "../../Constant";





export const procGPT35Text = (data:OpenAITextOption)=>{
    const req = data?.prompt??"";
    const match = req.match(RegExp(`${MOCK_USER}:(.+)\\n${MOCK_CHAR}:`))!;
    const msg = match[1];
    return {
        ...TemplateOpenAITextResponse,
        choices:[{
            index:0,
            text:buildResp('GPT35Text', msg),
            finish_reason:'stop',
            logprobs:null
        }]
    } satisfies OpenAITextRespFormat;
}