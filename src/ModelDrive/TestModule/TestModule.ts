import { SLogger, UtilFunc } from "@zwa73/utils";
import { getTokensizer } from "Tokensizer";
import { ChatTaskOption, LaMChatMessages, MessageType,OpenAITextChatTaskFormatter,TextCompletionOption } from "Task";
import { LaMInterface } from "LaMService";
import { OpenAITextRespFormat } from "ResponseFormat";


/**测试模型 */
export class TestModule implements LaMInterface{
    async isRuning(){return true;}
    async getData(){return {};}
    getDefaultOption(): TextCompletionOption {
        return {}
    }
    async encodeToken(str: string) {
        return getTokensizer("cl100k_base").encode(str);
    }
    async decodeToken(arr: number[]) {
        return getTokensizer("cl100k_base").decode(arr);
    }

    async chatTask(options:ChatTaskOption){
        SLogger.http(options);
        const resp:OpenAITextRespFormat = {
            "choices": [{
                "finish_reason": "stop",
                "index": 0,
                "logprobs": null,
                "text": `test time ${UtilFunc.getTime()}`
            }],
            "created": 1737376418,
            "id": "cmpl-ArlGEsDLJx7IJeeCynsgqAnVju4zt",
            "model": "gpt-3.5-turbo-instruct" as any,
            "object": "text_completion",
            "usage": {"completion_tokens":4248,"prompt_tokens":1849,"total_tokens":6097}
        };
        const result = {
            completed:OpenAITextChatTaskFormatter.formatResp(resp),
            pending:[]
        };
        return result;//DefChatLaMResult;
    }
    async chatCalcToken(messageList: LaMChatMessages): Promise<number> {
        let ntext:string="";
        for(const item of messageList){
            ntext=item.type==MessageType.DESC
            ? `${ntext}\n${item.content}`
            : `${ntext}\n${item.name}:${item.content}`;
        }
        const turboMessage = ntext.trim();
        return (await this.encodeToken(turboMessage)).length;
    }
}