import { lazyFunction, SLogger, UtilFunc } from "@zwa73/utils";

import type { OpenAIChatAPIEntry, OpenAIChatRequest } from "RequestFormat";
import { OpenAIChatAPIRole } from "RequestFormat";
import type { AnyOpenAIChatLikeResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from 'Task/Chat/Adapter';
import type { ThingBudget } from "Task/DataInterface";
import { commonFormatResp, tokenifyLogitBias } from "Task/Util";

import { commonOpenAIChatTask, commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";


/**OpenAI 推理预算映射表
 * 将内部预算标识映射到 OpenAI API 的 reasoning_effort 参数
 */
export const OpenAIThinkMap = {
    non:'minimal',
    hig:'high',
    mid:'medium',
    low:'low',
    min:'minimal',
    max:'xhigh',
} as const;

/**OpenAI 推理预算映射表 (支持 none)
 * 将内部预算标识映射到 OpenAI API 的 reasoning_effort 参数
 */
export const OpenAIThinkMapHasNone = {
    non:'none',
    hig:'high',
    mid:'medium',
    low:'low',
    min:'minimal',
    max:'xhigh',
} as const;

/**转换 OpenAI 推理预算
 * 根据模型版本选择合适的映射表,将内部预算标识转换为 OpenAI API 参数
 * @param model - 模型标识符,用于确定模型版本
 * @param budget - 内部预算标识
 */
const transOpenAIThinkBudget = (model:string,budget?:ThingBudget|null)=>{
    if(budget==undefined) return undefined;
    const ver = getVersion(model);
    if(ver==undefined || ver<5.1)
        return OpenAIThinkMap[budget];
    return OpenAIThinkMapHasNone[budget];
};

/**检查模型是否支持 stop 参数
 * o系列模型和 GPT-5 非聊天模型不支持 stop 参数
 * @param model - 模型标识符
 */
const hasReasoning = (model:string)=>{
    //o系列与5+非chat都不支持stop
    if(/^o/.test(model) || (/gpt-5(\.\d)?-/.test(model) && !model.includes('chat')))
        return true;
    return false;
};

/**从模型标识符中提取版本号
 * @param model - 模型标识符,如 "gpt-4", "gpt-3.5-turbo"
 */
const getVersion = (model:string)=>{
    const match = model.match(/gpt-(\d+)/);
    if(match==null) return undefined;
    const result = parseFloat(match[1]);
    return isNaN(result) ? undefined : result;
};


/**OpenAI 对话聊天任务格式化器类型定义 */
type OpenAIConversationChatTaskFormatter = ChatTaskFormatter<
    OpenAIChatAPIEntry[],OpenAIChatRequest,AnyOpenAIChatLikeResponse>;

/**OpenAI 对话聊天任务基础定义 */
export const OpenAIChatCompleteBase = {
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
                narr.push({
                    role:OpenAIChatAPIRole.System,
                    content:item.senderName+":"
                });
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
    formatMessage({messages,target}){
        messages.push({
            role:OpenAIChatAPIRole.System,
            content:`${target}:`,
        });
        return messages;
    },
    formatResp:(resp)=>{
        if(!UtilFunc.checkSharpSchema(resp,{
            choices:"array"
        })){
            SLogger.warn(`OpenAIConversationChatTaskFormatter.formatResp 错误, resp不符合格式, resp: `,resp);
            return { choices:[], vaild:false };
        }

        const choices = resp.choices
            .filter(choice => choice ?.message?.content!=undefined)
            .map(choice => ({content:choice .message.content!}));
        return {
            choices,
            vaild:choices.length>0
        };
    }
} as const satisfies Partial<OpenAIConversationChatTaskFormatter>;

export const OpenAIConversationChatTaskFormatter:OpenAIConversationChatTaskFormatter={
    ...OpenAIChatCompleteBase,
    async formatOption({option,modelId,tokensizerType}){
        //验证参数
        if(option.messages==null){
            SLogger.warn("TurboOptions 无效 messages为null");
            return;
        }
        if(option.messages.length==0){
            SLogger.warn("TurboOptions 无效 messages长度不足");
            return;
        }

        const messages = commonProcessMessageWithOpt({tool:OpenAIConversationChatTaskFormatter,option});

        const isReasoning = hasReasoning(modelId);
        return {
            model                  : modelId                 ,//模型id
            messages               : messages                ,//提示
            max_completion_tokens  : option.max_tokens          ,//最大生成令牌数
            reasoning_effort       : transOpenAIThinkBudget(modelId,option.think_budget),//推理预算
            temperature            : option.temperature         ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p                  : option.top_p               ,//top_p       权重控制 0为最准确 越大越偏离主题
            n                      : option.n                   ,//产生n条消息
            presence_penalty       : isReasoning ? undefined : option.presence_penalty   ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty      : isReasoning ? undefined : option.frequency_penalty  ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            logit_bias             : isReasoning ? undefined : await tokenifyLogitBias(option.logit_bias,tokensizerType),//调整某token出现的概率 {"tokenid":-100~100}
            stop                   : isReasoning ? undefined : option.stop,//停止序列,遭遇时将会停止生成的最多4个字符串,不支持某些思考模型
        } satisfies OpenAIChatRequest;

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(OpenAIConversationChatTaskFormatter)),
    computeTokenCount:lazyFunction(()=>stringifyComputeTokenCountFactory(OpenAIConversationChatTaskFormatter)),
    execute:lazyFunction(()=>commonOpenAIChatTask(OpenAIConversationChatTaskFormatter)),
};

