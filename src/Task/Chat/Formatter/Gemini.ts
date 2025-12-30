import { lazyFunction, SLogger } from "@zwa73/utils";

import type { GeminiOption, GeminiApiData, GeminiAPIEntry } from "RequestFormat";
import { GeminiAPIRole } from "RequestFormat";
import type { GeminiRespFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ThingBudget } from "Task/Interface";

import { commonFormatResp, stringifyCalcToken } from "./Utils";


export const GeminiThinkMap = {
    hig:1024,
    mid:512,
    low:256,
    min:128,
    max:2048,
};

export const transGeminiThinkBudget =  (modid:string,budget?:ThingBudget|null)=>{
    if(budget==undefined) return undefined;
    return GeminiThinkMap[budget];
};

export const GeminiChatTaskFormatter:ChatTaskFormatter<GeminiApiData,GeminiOption,GeminiRespFormat> = {
    formatOption(opt,model){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatOption 无效 messages为null");
            return;
        }
        if(opt.messages.list.length==0){
            SLogger.warn("GoogleChatOption 无效 messages长度不足");
            return;
        }


        //gemini-3-pro在hist超过一定长度后think_budget参数在无额外提示的情况下会被忽略
        const fxmsg = {...opt.messages};
        const think_budget = transGeminiThinkBudget(model,opt.think_budget);

        if(think_budget!=undefined && /gemini-3-pro/.test(model))
            fxmsg.tempPrompt = `${fxmsg.tempPrompt??''}(limit_thought_tokens_to_under_${think_budget}_words)`;
            //fxmsg.tempPrompt = `${fxmsg.tempPrompt??''}(think_of_reason_tokens_briefly_no_more_than_${opt.think_budget}_words)`;

        let turboMessahge = GeminiChatTaskFormatter.transReq(opt.target,fxmsg);
        turboMessahge = GeminiChatTaskFormatter.formatReq(opt.target,turboMessahge);

        return {
            system_instruction:{parts:{text:turboMessahge.define}},
            contents:turboMessahge.message,
            generationConfig:{
                stopSequences   :opt.stop         ?? undefined,
                temperature     :opt.temperature  ?? undefined,
                maxOutputTokens :opt.max_tokens   ?? undefined,
                topP            :opt.top_p        ?? undefined,
                thinkingConfig: {
                    thinkingBudget:opt.think_budget ? think_budget : undefined,
                    includeThoughts:true,
                }
            }
        } satisfies GeminiOption;
    },
    calcToken:lazyFunction(()=>stringifyCalcToken(GeminiChatTaskFormatter)),
    formatResult:lazyFunction(()=>commonFormatResp(GeminiChatTaskFormatter)),
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GeminiAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList.list){
            if(item.type=='desc'){
                //头部说明直接合并
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
                    narr.push({
                        role:GeminiAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:GeminiAPIRole.User,
                    parts:[{text:item.senderName+":"}]
                });
                if(item.senderName==chatTarget){
                    narr.push({
                        role:GeminiAPIRole.Model,
                        parts:[{text:item.content}]
                    });
                }else{
                    narr.push({
                        role:GeminiAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }
        }

        //处理临时提示
        if(messageList.tempPrompt!=null && messageList.tempPrompt.length>0)
            narr[narr.length-1].parts[0].text += messageList.tempPrompt;
        return {
            message:narr,
            define:desc.trim(),
        };
    },
    formatReq(chatTarget,chatList){
        chatList.message.push({
            role:GeminiAPIRole.User,
            parts:[{text:`${chatTarget}:`}],
        });
        return chatList;
    },
    formatResp:(resp)=>{
        //挑出非思考的文本内容
        const cond = (v:GeminiRespFormat['candidates'][number]['content']['parts'][number])=>v.text && !v.thought;
        const choices = resp.candidates
            .filter(choice => choice?.content?.parts?.some(cond))
            .map(choice => ({ content: choice.content.parts.find(cond)?.text! }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};
