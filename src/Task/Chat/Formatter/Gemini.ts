import { lazyFunction, SLogger } from "@zwa73/utils";

import type { GeminiRequestFormat, GeminiApiData, GeminiAPIEntry } from "RequestFormat";
import { GeminiAPIRole, GeminiHarmCategoryList } from "RequestFormat";
import type { GeminiResponseFormat } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption } from "Task/Chat/Interface";
import type { ThingBudget } from "Task/DataInterface";
import { commonFormatResp } from "Task/Util";

import { commonProcessMessage, stringifyComputeTokenCountFactory } from "./Utils";



/** Gemini的think_budget参数映射表*/
export const GeminiThinkMap = {
    hig:1024,
    mid:512,
    low:256,
    non:128,
    min:128,
    max:2048,
};

/**转换Gemini的think_budget参数
 * @param modid  - 模型ID
 * @param budget - 预算
 */
export const transGeminiThinkBudget =  (modid:string,budget?:ThingBudget|null)=>{
    if(budget==undefined) return undefined;
    return GeminiThinkMap[budget];
};

/**修正gemini的message
 * gemini-3-pro与2.5在hist超过一定长度后think_budget参数在无额外提示的情况下会被忽略
 * @param model - 模型ID
 * @param opt   - 任务参数
 */
export const combineHint = (model:string,opt:ChatTaskOption)=>{
    const think_budget = transGeminiThinkBudget(model,opt.think_budget);
    if(think_budget!=undefined && (
        /gemini-3-pro/.test(model) ||
        /gemini-2.5-pro/.test(model)
    )) return `${opt.hint??''}(limit_thought_tokens_to_under_${think_budget}_words)`;
    return opt.hint;
};

const AllOff = GeminiHarmCategoryList.map(v=>({category:v,threshold:"OFF"}) as const);

export const GeminiChatTaskFormatter:ChatTaskFormatter<GeminiApiData,GeminiRequestFormat,GeminiResponseFormat> = {
    formatOption({option,modelId}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("GoogleChatOption 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("GoogleChatOption 无效 messages长度不足");
            return;
        }


        //gemini-3-pro在hist超过一定长度后think_budget参数在无额外提示的情况下会被忽略
        const fxhint = combineHint(modelId,option);
        const think_budget = transGeminiThinkBudget(modelId,option.think_budget);

        const messages = commonProcessMessage({
            tool:GeminiChatTaskFormatter,
            target:option.target,
            hint:fxhint,
            messages:option.messages,
        });

        return {
            system_instruction:{parts:{text:messages.define}},
            contents:messages.message,
            generationConfig:{
                stopSequences   :option.stop         ?? undefined,
                temperature     :option.temperature  ?? undefined,
                maxOutputTokens :option.max_tokens   ?? undefined,
                topP            :option.top_p        ?? undefined,
                thinkingConfig: {
                    thinkingBudget:option.think_budget ? think_budget : undefined,
                    includeThoughts:true,
                }
            },
            //safetySettings:AllOff
        } satisfies GeminiRequestFormat;
    },
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(GeminiChatTaskFormatter)),
    formatResult:lazyFunction(()=>commonFormatResp(GeminiChatTaskFormatter)),
    buildMessage({target,messages,hint}){
        let desc = "";
        let inDesc = true;
        const narr:GeminiAPIEntry[] = [];

        //处理主消息列表
        for(const item of messages){
            if(item.type=='desc'){
                //头部说明直接合并
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
                    narr.push({
                        role:GeminiAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:GeminiAPIRole.User,
                    parts:[{text:item.senderName+":"}]
                });
                if(item.senderName==target){
                    narr.push({
                        role:GeminiAPIRole.Model,
                        parts:[{text:item.content}]
                    });
                }else{
                    narr.push({
                        role:GeminiAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }
        }

        //处理临时提示
        if(hint!=null && hint.length>0)
            narr[narr.length-1].parts[0].text += hint;
        return {
            message:narr,
            define:desc.trim(),
        };
    },
    formatMessage({target,messages}){
        messages.message.push({
            role:GeminiAPIRole.User,
            parts:[{text:`${target}:`}],
        });
        return messages;
    },
    formatResp:(resp)=>{
        //挑出非思考的文本内容
        const cond = (v:GeminiResponseFormat['candidates'][number]['content']['parts'][number])=>v.text && !v.thought;
        const choices = resp.candidates
            .filter(choice => choice?.content?.parts?.some(cond))
            .map(choice => ({ content: choice.content.parts.find(cond)?.text! }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};
