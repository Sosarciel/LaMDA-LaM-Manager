import { lazyFunction, SLogger } from "@zwa73/utils";

import type { OpenAITextRequestFormat } from "RequestFormat";
import type { OpenAITextResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAITextCompleteBase } from "./OpenAIText";
import { commonCalcTokenFactory, commonProcessMessageWithOpt } from "./Utils";



export const DeepseekTextChatTaskFormatter:ChatTaskFormatter<string,OpenAITextRequestFormat,OpenAITextResponseFormat>={
    ...OpenAITextCompleteBase,
    formatOption(opt,{modelId,tokensizerType}){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("DeepseekTextChatTaskFormatter Options 无效 messages为null");
            return;
        }
        if(opt.messages.list.length==0){
            SLogger.warn("DeepseekTextChatTaskFormatter Options 无效 messages长度不足");
            return;
        }

        //转换文本
        const messages = commonProcessMessageWithOpt(DeepseekTextChatTaskFormatter,opt);

        return {
            model             : modelId                  ,//模型id
            prompt            : messages                 ,//提示
            max_tokens        : opt.max_tokens           ,//最大生成令牌数
            temperature       : opt.temperature          ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : opt.presence_penalty     ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty : opt.frequency_penalty    ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            stop              : opt.stop                 ,//遭遇时将会停止生成的最多4个字符串 "1234"
        } satisfies OpenAITextRequestFormat;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekTextChatTaskFormatter)),
    calcToken:lazyFunction(()=>commonCalcTokenFactory(DeepseekTextChatTaskFormatter)),
};

//void (async ()=>{
//    console.log(await OpenAITextChatFormater.calcToken(new LaMChatMessages({
//        type:MessageType.DESC,
//        content:"你好，我的民资是"
//    }),"deepseek"))
//})();
