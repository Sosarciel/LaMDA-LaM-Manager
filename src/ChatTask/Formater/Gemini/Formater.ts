import { SLogger } from "@zwa73/utils";
import { GoogleChatAPIEntry, GoogleChatTaskTool} from './Tool';
import { AnyGoogleChatRespFormat } from "RespFormat";
import { ChatTaskFormater } from "../ChatFormatAdapter";
import { commonFormatResp, stringifyCalcToken } from "../Utils";
import { ChatTaskOption } from "@/src/ChatTask/ChatTaskInterface";


export type GeminiChatOption={
    system_instruction:{parts:{text: string}},
    contents:GoogleChatAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
        thinkingBudget?: number|undefined;
    }
}

export const GeminiChatTaskFormater:ChatTaskFormater<GeminiChatOption,AnyGoogleChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):GeminiChatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatOption 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("GoogleChatOption 无效 messages长度不足");
            return;
        }

        let turboMessahge = GoogleChatTaskTool.transReq(opt.target,opt.messages);
        turboMessahge = GoogleChatTaskTool.formatReq(opt.target,turboMessahge);

        return {
            system_instruction:{parts:{text:turboMessahge.define}},
            contents:turboMessahge.message,
            generationConfig:{
                stopSequences:opt.stop??undefined,
                temperature:opt.temperature??undefined,
                maxOutputTokens:opt.max_tokens??undefined,
                topP:opt.top_p??undefined,
                thinkingBudget:opt.think_budget??undefined,
            }
        };
    },
    calcToken:stringifyCalcToken(GoogleChatTaskTool),
    formatResult:commonFormatResp(GoogleChatTaskTool),
};
