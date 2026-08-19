import { lazyFunction, SLogger } from "@zwa73/utils";

import { LaMChain } from "LaMChain";
import { type OpenAIChatAPIEntry, type DeepseekAPIEntry, type DeepseekRequest, OpenAIChatAPIRole } from "RequestFormat";
import type { DeepseekResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption } from "Task/Chat/Interface";
import type { ThingBudget } from "Task/DataInterface";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIChat";
import { commonOpenAIChatTask, commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";



/**推理预算映射表
 * 将内部预算标识映射到 Deepseek API 的 reasoning_effort 参数
 */
export const DeepseekThinkMapHasNone = {
    hig:'high',
    mid:'high',
    low:'low',
    min:'low',
    max:'max',
    non:undefined,
} as const;


export const buildDeepseekRequest = ({option,modelId,messages}:{
    option: ChatTaskOption;
    modelId: string;
    messages: DeepseekAPIEntry[];
    think_budget: ThingBudget | null | undefined;
})=>{
    const effort = DeepseekThinkMapHasNone[option.think_budget??"non"];
    return LaMChain.stripUndefined({
        model             : modelId                        ,//模型id
        messages          : messages                       ,//提示
        max_tokens        : option.max_tokens              ,//最大生成令牌数
        temperature       : option.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
        top_p             : option.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
        presence_penalty  : option.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
        frequency_penalty : option.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
        stop              : option.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        thinking          :{type:effort==undefined ? "disabled" : "enabled"},
        ...(effort ==undefined ? { } : {reasoning_effort:effort})
    } satisfies DeepseekRequest);
};

/**传统OpenAI系统提示模式的Formatter */
export const DeepseekChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequest,DeepseekResponse> = {
    ...OpenAIChatCompleteBase,
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

        const messages = commonProcessMessageWithOpt({tool:DeepseekChatTaskFormatter,option});

        return buildDeepseekRequest({messages,modelId,option,think_budget:option.think_budget});

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(DeepseekChatTaskFormatter)),
    execute:lazyFunction(()=>commonOpenAIChatTask(DeepseekChatTaskFormatter)),
};

/**传统OpenAI系统提示模式的Formatter 无角色标签版本 */
export const DeepseekRawChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequest,DeepseekResponse> = {
    ...OpenAIChatCompleteBase,
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

        const messages = commonProcessMessageWithOpt({tool:DeepseekRawChatTaskFormatter,option});

        return buildDeepseekRequest({messages,modelId,option,think_budget:option.think_budget});

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    buildMessage({target,messages,hint}){
        const narr:OpenAIChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messages){
            if(item.type=='desc'){
                narr.push({
                    role:OpenAIChatAPIRole.System,
                    content:item.content
                });
            }else{
                //与目标名相等时认为是 Assistant
                if(item.senderName==target){
                    narr.push({
                        role:OpenAIChatAPIRole.Assistant,
                        content:item.content
                    });
                }else{
                    narr.push({
                        role:OpenAIChatAPIRole.User,
                        content:item.content
                    });
                }
            }
        }

        //处理临时提示
        if(hint!=null && hint.length>0)
            narr[narr.length-1].content += hint;

        return narr;
    },
    formatMessage({messages}){
        return messages;
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekRawChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(DeepseekRawChatTaskFormatter)),
    execute:lazyFunction(()=>commonOpenAIChatTask(DeepseekRawChatTaskFormatter)),
};