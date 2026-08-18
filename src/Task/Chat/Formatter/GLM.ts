import { lazyFunction, SLogger, UtilFunc } from "@zwa73/utils";

import type { GLMAPIEntry, GLMRequest } from "RequestFormat";
import type { GLMResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIChat";
import { commonChatTask, commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";


/** GLM 推理预算映射表 */
export const GLMThinkMap = {
    non: "disabled",
    min: "enabled",
    low: "enabled",
    mid: "enabled",
    hig: "enabled",
    max: "enabled",
} as const;

/** GLM ChatTask Formatter */
export const GLMChatTaskFormatter:ChatTaskFormatter<GLMAPIEntry[],GLMRequest,GLMResponse> = {
    ...OpenAIChatCompleteBase,
    async formatOption({option,modelId}){
        if(option.messages==null){
            SLogger.warn("GLMChatOptions 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("GLMChatOptions 无效 messages长度不足");
            return;
        }

        const messages = commonProcessMessageWithOpt({tool:GLMChatTaskFormatter,option});
        const thinkType = GLMThinkMap[option.think_budget??"non"];

        return {
            model             : modelId                        ,
            messages          : messages                       ,
            max_tokens        : option.max_tokens              ,
            temperature       : option.temperature             ,
            top_p             : option.top_p                   ,
            stop              : option.stop                    ,
            do_sample         : true                           ,
            thinking          : {type:thinkType}               ,
        } satisfies GLMRequest;
    },
    formatResp(resp){
        if(!UtilFunc.checkSharpSchema(resp,{
            choices:"array"
        })){
            SLogger.warn(`GLMChatTaskFormatter.formatResp 错误, resp不符合格式, resp: `,resp);
            return { choices:[], vaild:false };
        }

        const choices = resp.choices
            .filter(choice => choice?.message?.content!=undefined)
            .map(choice => ({content:choice.message.content!}));
        return {
            choices,
            vaild:choices.length>0
        };
    },
    formatResult:lazyFunction(()=>commonFormatResp(GLMChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(GLMChatTaskFormatter)),
    execute:lazyFunction(()=>commonChatTask({tool:GLMChatTaskFormatter})),
};
