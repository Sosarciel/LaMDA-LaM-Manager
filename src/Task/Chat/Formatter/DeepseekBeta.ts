import { SLogger, lazyFunction } from "@zwa73/utils";

import type { DeepseekAPIEntry, DeepseekRequestFormat } from "RequestFormat";
import { DeepseekAPIRole } from "RequestFormat";
import type { DeepseekResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIConversation";
import { commonProcessMessageWithOpt, stringifyCalcTokenFactory } from "./Utils";




/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**前缀续写模式的Formater */
export const DeepseekBetaChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequestFormat,DeepseekResponseFormat> = {
    formatOption(opt,model){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("DeepseekChatOptions 无效 messages为null");
            return;
        }
        if(opt.messages.list.length==0){
            SLogger.warn("DeepseekChatOptions 无效 messages长度不足");
            return;
        }

        const messages = commonProcessMessageWithOpt(DeepseekBetaChatTaskFormatter,opt);

        return {
            model             : model                       ,//模型id
            messages          : messages                    ,//提示
            max_tokens        : opt.max_tokens              ,//最大生成令牌数
            temperature       : opt.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : opt.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : opt.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : opt.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        } satisfies DeepseekRequestFormat;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekBetaChatTaskFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcTokenFactory(DeepseekBetaChatTaskFormatter)),
    buildMessage(chatTarget,messageList){
        const narr:DeepseekAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList.list){
            if(item.type=='desc'){
                narr.push({
                    role:DeepseekAPIRole.System,
                    content:item.content
                });
            }else{
                if(item.senderName==chatTarget){
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
        if(messageList.tempPrompt!=null && messageList.tempPrompt.length>0)
            narr[narr.length-1].content += messageList.tempPrompt;

        return narr;
    },
    formatMessage(chatTarget,chatList){
        const out:DeepseekAPIEntry[] = [
            ...chatList,
            {
                role:DeepseekAPIRole.Assistant,
                content:chatTarget+":",
                prefix:true
            }
        ];
        return out;
    },
    formatResp:OpenAIChatCompleteBase.formatResp,
};
