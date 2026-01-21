import { lazyFunction, SLogger } from "@zwa73/utils";

import type { DeepseekAPIEntry, DeepseekRequestFormat } from "RequestFormat";
import type { DeepseekResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIConversation";
import { commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";




/**传统OpenAI系统提示模式的Formater */
export const DeepseekChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekRequestFormat,DeepseekResponseFormat> = {
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

        return {
            model             : modelId                     ,//模型id
            messages          : messages                    ,//提示
            max_tokens        : option.max_tokens              ,//最大生成令牌数
            temperature       : option.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : option.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : option.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : option.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : option.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        } satisfies DeepseekRequestFormat;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(DeepseekChatTaskFormatter)),
};