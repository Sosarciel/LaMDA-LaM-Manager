import { SLogger, lazyFunction } from "@zwa73/utils";

import type { DeepseekAPIEntry, DeepseekRequest } from "RequestFormat";
import { DeepseekAPIRole } from "RequestFormat";
import type { DeepseekResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIConversation";
import { commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";




/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**前缀续写模式的Formater */
export const DeepseekBetaChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequest,DeepseekResponse> = {
    formatOption({option,modelId}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("DeepseekChatOptions 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("DeepseekChatOptions 无效 messages长度不足");
            return;
        }

        const messages = commonProcessMessageWithOpt({tool:DeepseekBetaChatTaskFormatter,option});

        return {
            model             : modelId                     ,//模型id
            messages          : messages                    ,//提示
            max_tokens        : option.max_tokens              ,//最大生成令牌数
            temperature       : option.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : option.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : option.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : option.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : option.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        } satisfies DeepseekRequest;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekBetaChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(DeepseekBetaChatTaskFormatter)),
    buildMessage({messages,target,hint}){
        const narr:DeepseekAPIEntry[] = [];

        //处理主消息列表
        for(const item of messages){
            if(item.type=='desc'){
                narr.push({
                    role:DeepseekAPIRole.System,
                    content:item.content
                });
            }else{
                if(item.senderName==target){
                    narr.push({
                        role:DeepseekAPIRole.Assistant,
                        content:item.senderName+":"+item.content
                    });
                }else{
                    narr.push({
                        role:DeepseekAPIRole.User,
                        content:item.senderName+":"+item.content
                    });
                }
            }
        }

        //处理临时提示
        if(hint!=null && hint.length>0)
            narr[narr.length-1].content += hint;

        return narr;
    },
    formatMessage({messages,target}){
        const out:DeepseekAPIEntry[] = [
            ...messages,
            {
                role:DeepseekAPIRole.Assistant,
                content:target+":",
                prefix:true
            }
        ];
        return out;
    },
    formatResp:OpenAIChatCompleteBase.formatResp,
};
