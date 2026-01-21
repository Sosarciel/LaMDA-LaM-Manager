import { lazyFunction, SLogger } from "@zwa73/utils";

import type { GeminiCompatAPIEntry, GeminiCompatRequestFormat } from "RequestFormat";
import type { OpenAIConversationResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { combineHint, transGeminiThinkBudget } from "./Gemini";
import { OpenAIChatCompleteBase } from "./OpenAIConversation";
import { commonProcessMessage, stringifyComputeTokenCountFactory } from "./Utils";


/**gemini的openai兼容api格式化工具 */
export const GeminiCompatChatTaskFormatter:ChatTaskFormatter<GeminiCompatAPIEntry[],GeminiCompatRequestFormat,OpenAIConversationResponseFormat> = {
    ...OpenAIChatCompleteBase,
    formatOption({option,modelId}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("GeminiCompat 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("GeminiCompat 无效 messages长度不足");
            return;
        }

        const fxhint = combineHint(modelId,option);
        const think_budget = transGeminiThinkBudget(modelId,option.think_budget);

        const messages = commonProcessMessage({
            tool:GeminiCompatChatTaskFormatter,
            target:option.target,
            hint:fxhint,
            messages:option.messages,
        });

        const obj:GeminiCompatRequestFormat = {
            model             : modelId                     ,//模型id
            messages          : messages                    ,//提示
            max_tokens        : option.max_tokens              ,//最大生成令牌数
            temperature       : option.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : option.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : option.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : option.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : option.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        };

        if(think_budget!=null){
            //thinking为gptge特殊模型 GptGe的思考参数无效 对于 thinking 模型直接改变模型id实现
            if(obj.model?.endsWith('-thinking'))
                obj.model = `${obj.model}-${Math.floor(think_budget)}`;
            else{
                obj.extra_body??={};
                obj.extra_body.google = {
                    thinking_config:{
                        thinking_budget: think_budget
                    }
                };
            }
        }

        return obj;
    },
    formatResult:lazyFunction(()=>commonFormatResp(GeminiCompatChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(GeminiCompatChatTaskFormatter)),
};