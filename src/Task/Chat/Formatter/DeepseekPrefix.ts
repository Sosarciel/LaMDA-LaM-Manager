import { SLogger, lazyFunction } from "@zwa73/utils";

import type { DeepseekAPIEntry, DeepseekRequest } from "RequestFormat";
import { DeepseekAPIRole } from "RequestFormat";
import type { DeepseekResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { buildDeepseekRequest } from "./Deepseek";
import { OpenAIChatCompleteBase } from "./OpenAIChat";
import { commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";




/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**前缀续写模式的Formatter */
export const DeepseekPrefixChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequest,DeepseekResponse> = {
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

        const messages = commonProcessMessageWithOpt({tool:DeepseekPrefixChatTaskFormatter,option});

        return buildDeepseekRequest({messages,modelId,option,think_budget:option.think_budget});

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekPrefixChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(DeepseekPrefixChatTaskFormatter)),
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
                        content:`${item.senderName}:${item.content}`
                    });
                }else{
                    narr.push({
                        role:DeepseekAPIRole.User,
                        content:`${item.senderName}:${item.content}`
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
                content:`${target}:`,
                prefix:true
            }
        ];
        return out;
    },
    formatResp:OpenAIChatCompleteBase.formatResp,
};
