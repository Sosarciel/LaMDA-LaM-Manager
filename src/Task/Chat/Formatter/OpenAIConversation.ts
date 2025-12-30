import { lazyFunction, SLogger, UtilFunc } from "@zwa73/utils";

import type { OpenAIConversationAPIEntry, OpenAIConversationOption } from "RequestFormat";
import { OpenAIConversationAPIRole } from "RequestFormat";
import type { AnyOpenAIConversationLikeRespFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from 'Task/Chat/Adapter';
import type { ThingBudget } from "Task/Interface";

import { commonFormatResp, stringifyCalcToken } from "./Utils";


export const OpenAIThinkMap = {
    hig:'high',
    mid:'medium',
    low:'low',
    min:'minimal',
    max:'xhigh',
} as const;
export const OpenAIThinkMapHasNone = {
    hig:'high',
    mid:'medium',
    low:'low',
    min:'none',
    max:'xhigh',
} as const;
export const transOpenAIThinkBudger = (modid:string,budget?:ThingBudget|null)=>{
    if(budget==undefined) return undefined;
    const match = modid.match(/gpt-(\d+)/);
    if(match==null) return OpenAIThinkMap[budget];
    if(parseFloat(match[1])<5.1)
        return OpenAIThinkMap[budget];
    return OpenAIThinkMapHasNone[budget];
};

export const OpenAIConversationChatTaskFormatter:ChatTaskFormatter<OpenAIConversationAPIEntry[],OpenAIConversationOption,AnyOpenAIConversationLikeRespFormat>={
    formatOption(opt,model){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("TurboOptions 无效 messages为null");
            return;
        }
        if(opt.messages.list.length==0){
            SLogger.warn("TurboOptions 无效 messages长度不足");
            return;
        }

        let turboMessahge = OpenAIConversationChatTaskFormatter.transReq(opt.target,opt.messages);
        turboMessahge = OpenAIConversationChatTaskFormatter.formatReq(opt.target,turboMessahge);

        return {
            model                  : model                   ,//模型id
            messages               : turboMessahge           ,//提示
            max_completion_tokens  : opt.max_tokens          ,//最大生成令牌数
            reasoning_effort       : transOpenAIThinkBudger(model,opt.think_budget),
            temperature            : opt.temperature         ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p                  : opt.top_p               ,//top_p       权重控制 0为最准确 越大越偏离主题
            n                      : opt.n                   ,//产生n条消息
            presence_penalty       : opt.presence_penalty    ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty      : opt.frequency_penalty   ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            logit_bias             : opt.logit_bias          ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            //best_of              : best_of                 ,//产生n条候选消息，根据n返回n条最佳消息
            stop                   : opt.stop                ,//调整某token出现的概率 {"tokenid":-100~100}
        } satisfies OpenAIConversationOption;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(OpenAIConversationChatTaskFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcToken(OpenAIConversationChatTaskFormatter)),
    transReq(chatTarget,messageList){
        const narr:OpenAIConversationAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList.list){
            if(item.type=='desc'){
                narr.push({
                    role:OpenAIConversationAPIRole.System,
                    content:item.content
                });
            }else{
                narr.push({
                    role:OpenAIConversationAPIRole.System,
                    content:item.senderName+":"
                });
                if(item.senderName==chatTarget){
                    narr.push({
                        role:OpenAIConversationAPIRole.Assistant,
                        content:item.content
                    });
                }else{
                    narr.push({
                        role:OpenAIConversationAPIRole.User,
                        content:item.content
                    });
                }
            }
        }

        //处理临时提示
        if(messageList.tempPrompt!=null && messageList.tempPrompt.length>0)
            narr[narr.length-1].content += messageList.tempPrompt;

        return narr;
    },
    formatReq(chatTarget,chatList){
        chatList.push({
            role:OpenAIConversationAPIRole.System,
            content:`${chatTarget}:`,
        });
        return chatList;
    },
    formatResp:(resp)=>{
        if(!UtilFunc.checkSharpSchema(resp,{
            choices:"array"
        })){
            SLogger.warn(`OpenAIConversationChatTaskFormatter.formatResp 错误, resp不符合格式, resp: `,resp);
            return { choices:[], vaild:false };
        }

        const choices = resp.choices
            .filter(choice => choice ?.message?.content!=undefined)
            .map(choice => ({content:choice .message.content!}));
        return {
            choices,
            vaild:choices.length>0
        };
    }
};

