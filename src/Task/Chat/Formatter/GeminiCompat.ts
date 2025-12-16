import { lazyFunction, SLogger } from "@zwa73/utils";

import type { GeminiCompatAPIEntry, GeminiCompatOption } from "RequestFormat";
import type { OpenAIConversationRespFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";

import { OpenAIConversationChatTaskFormatter } from "./OpenAIConversation";
import { commonFormatResp, stringifyCalcToken } from "./Utils";


/**gemini的openai兼容api格式化工具 */
export const GeminiCompatChatTaskFormatter:ChatTaskFormatter<GeminiCompatAPIEntry[],GeminiCompatOption,OpenAIConversationRespFormat> = {
    formatOption(opt,model){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GeminiCompat 无效 messages为null");
            return;
        }
        if(opt.messages.list.length==0){
            SLogger.warn("GeminiCompat 无效 messages长度不足");
            return;
        }

        //gemini-3-pro在hist超过一定长度后think_budget参数在无额外提示的情况下会被忽略
        const fxmsg = {...opt.messages};
        if(opt.think_budget!=undefined && /gemini-3-pro/.test(model))
            fxmsg.tempPrompt = `(think of reason tokens briefly no more than ${opt.think_budget} words)${fxmsg.tempPrompt??''}`;

        let msg = GeminiCompatChatTaskFormatter.transReq(opt.target,fxmsg);
        msg = GeminiCompatChatTaskFormatter.formatReq(opt.target,msg);

        const obj:GeminiCompatOption = {
            model             : model                       ,//模型id
            messages          : msg                         ,//提示
            max_tokens        : opt.max_tokens              ,//最大生成令牌数
            temperature       : opt.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : opt.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : opt.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : opt.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        };

        if(opt.think_budget!=null){
            //thinking为gptge特殊模型 GptGe的思考参数无效 对于 thinking 模型直接改变模型id实现
            if(obj.model?.endsWith('-thinking'))
                obj.model = `${obj.model}-${Math.floor(opt.think_budget)}`;
            else{
                obj.extra_body??={};
                obj.extra_body.google = {
                    thinking_config:{
                        thinking_budget: opt.think_budget
                    }
                };
            }
        }

        return obj;
    },
    formatResult:lazyFunction(()=>commonFormatResp(GeminiCompatChatTaskFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcToken(GeminiCompatChatTaskFormatter)),
    transReq:OpenAIConversationChatTaskFormatter.transReq,
    formatReq:OpenAIConversationChatTaskFormatter.formatReq,
    formatResp:OpenAIConversationChatTaskFormatter.formatResp,
};