import { lazyFunction, SLogger } from "@zwa73/utils";
import { LaMChain } from "LaMChain";

import type { OpenAITextRequest } from "RequestFormat";
import type { OpenAITextResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { commonOpenAIChatTask, commonComputeTokenCountFactory, commonProcessMessageWithOpt } from "./Utils";



/**OpenAI 文本聊天任务格式化器类型定义 */
type OpenAITextChatTaskFormatter = ChatTaskFormatter<string,OpenAITextRequest,OpenAITextResponse>;

/**OpenAI 文本聊天任务基础定义 */
export const OpenAITextCompleteBase = {
    buildMessage({messages,target,hint}){
        let ntext="";

        //处理主消息列表
        for(const item of messages){
            ntext=item.type=='desc'
            ? `${ntext}\n${item.content}`
            : `${ntext}\n${item.senderName}:${item.content}`;
        }

        //处理临时提示
        if(hint!=null && hint.length>0)
            ntext += hint;

        return ntext.trim();
    },
    formatMessage({messages,target}){
        return `${messages}\n${target}:`;
    },
    formatResp:(resp)=>{
        // 提取 choices 列表
        const choices = resp.choices
            .filter(choice => choice?.text != undefined)
            .map(choice => ({ content: choice.text }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
} satisfies Partial<OpenAITextChatTaskFormatter>;

export const OpenAITextChatTaskFormatter:OpenAITextChatTaskFormatter={
    ...OpenAITextCompleteBase,
    async formatOption({option,modelId,tokensizerType}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("OpenAITextChatTaskFormatter Options 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("OpenAITextChatTaskFormatter Options 无效 messages长度不足");
            return;
        }

        //转换文本
        const messages = commonProcessMessageWithOpt({tool:OpenAITextChatTaskFormatter,option});

        return LaMChain.stripUndefined({
            model             : modelId                  ,//模型id
            prompt            : messages                 ,//提示
            max_tokens        : option.max_tokens           ,//最大生成令牌数
            temperature       : option.temperature          ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : option.top_p                ,//top_p       权重控制 0为最准确 越大越偏离主题
            n                 : option.n                    ,//产生n条消息
            presence_penalty  : option.presence_penalty     ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty : option.frequency_penalty    ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            logit_bias        : await LaMChain.tokenifyLogitBias({textLogitBias:option.logit_bias,tokensizerType}) ,//调整某token出现的概率 {"tokenid":-100~100}
            //best_of         : best_of                  ,//产生n条候选消息，根据n返回n条最佳消息
            stop              : option.stop                 ,//遭遇时将会停止生成的最多4个字符串 "1234"
        } satisfies OpenAITextRequest);

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(OpenAITextChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>commonComputeTokenCountFactory(OpenAITextChatTaskFormatter)),
    execute:lazyFunction(()=>commonOpenAIChatTask(OpenAITextChatTaskFormatter)),
};

//void (async ()=>{
//    console.log(await OpenAITextChatFormatter.computeToken(new LaMChatMessages({
//        type:MessageType.DESC,
//        content:"你好，我的民资是"
//    }),"deepseek"))
//})();
