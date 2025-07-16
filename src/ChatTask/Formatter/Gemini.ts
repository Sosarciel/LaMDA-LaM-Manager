import { memoizeGetter, SLogger } from "@zwa73/utils";
import { AnyGoogleChatRespFormat } from "RespFormat";
import { ChatTaskFormatter } from "../ChatFormatAdapter";
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { ChatTaskOption, MessageType } from "@/src/ChatTask/ChatTaskInterface";


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
export type GoogleChatAPIEntry={
    role: GoogleChatAPIRole;
    parts:[{text:string}];
}

enum GoogleChatAPIRole{
    User="user",
    Model="model",
}

type GoogleChatApiData = {
    message:GoogleChatAPIEntry[];
    define :string;
}



export const GeminiChatTaskFormatter:ChatTaskFormatter<GoogleChatApiData,GeminiChatOption,AnyGoogleChatRespFormat> = {
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

        let turboMessahge = GeminiChatTaskFormatter.transReq(opt.target,opt.messages);
        turboMessahge = GeminiChatTaskFormatter.formatReq(opt.target,turboMessahge);

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
    calcToken:memoizeGetter(()=>stringifyCalcToken(GeminiChatTaskFormatter)),
    formatResult:memoizeGetter(()=>commonFormatResp(GeminiChatTaskFormatter)),
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GoogleChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                //头部说明直接合并
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
                    narr.push({
                        role:GoogleChatAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:GoogleChatAPIRole.User,
                    parts:[{text:item.name+":"}]
                });
                if(item.name==chatTarget){
                    narr.push({
                        role:GoogleChatAPIRole.Model,
                        parts:[{text:item.content}]
                    });
                }else{
                    narr.push({
                        role:GoogleChatAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }
        }
    
        //处理临时提示
        if(messageList.getTemporaryPrompt().length>0)
            narr[narr.length-1].parts[0].text += messageList.getTemporaryPrompt();
    
        return {
            message:narr,
            define:desc.trim(),
        };
    },
    formatReq(chatTarget,chatList){
        chatList.message.push({
            role:GoogleChatAPIRole.User,
            parts:[{text:`${chatTarget}:`}],
        });
        return chatList;
    },
    formatResp:(resp)=>{
        const choices = resp.candidates
            .filter(choice => choice?.content?.parts?.[0]?.text != undefined)
            .map(choice => ({ content: choice.content.parts[0].text }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};
