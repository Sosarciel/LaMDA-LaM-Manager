import { lazyFunction, SLogger } from "@zwa73/utils";

import type { OpenAITextRequestFormat } from "RequestFormat";
import type { OpenAITextResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAITextCompleteBase } from "./OpenAIText";
import { commonComputeTokenCountFactory, commonProcessMessageWithOpt } from "./Utils";



export const DeepseekTextChatTaskFormatter:ChatTaskFormatter<string,OpenAITextRequestFormat,OpenAITextResponseFormat>={
    ...OpenAITextCompleteBase,
    formatOption({option,modelId}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("DeepseekTextChatTaskFormatter Options 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("DeepseekTextChatTaskFormatter Options 无效 messages长度不足");
            return;
        }

        //转换文本
        const messages = commonProcessMessageWithOpt({tool:DeepseekTextChatTaskFormatter,option});

        return {
            model             : modelId                  ,//模型id
            prompt            : messages                 ,//提示
            max_tokens        : option.max_tokens           ,//最大生成令牌数
            temperature       : option.temperature          ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : option.top_p                ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : option.presence_penalty     ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty : option.frequency_penalty    ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            stop              : option.stop                 ,//遭遇时将会停止生成的最多4个字符串 "1234"
        } satisfies OpenAITextRequestFormat;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekTextChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>commonComputeTokenCountFactory(DeepseekTextChatTaskFormatter)),
};

//void (async ()=>{
//    console.log(await OpenAITextChatFormater.computeToken(new LaMChatMessages({
//        type:MessageType.DESC,
//        content:"你好，我的民资是"
//    }),"deepseek"))
//})();
