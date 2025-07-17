import { lazyFunction, SLogger } from "@zwa73/utils";
import { OpenAIConversationModel } from "ModelConfig";
import { ChatTaskFormatter } from '../ChatFormatAdapter';
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { AnyOpenAIChatApiRespFormat } from "ResponseFormat";
import { ChatTaskOption, MessageType } from "../ChatTaskInterface";
import { OpenAIConversationAPIEntry, OpenAIConversationAPIRole, OpenAIConversationOption } from "RequestFormat";

export const OpenAIConversationChatFormatter:ChatTaskFormatter<OpenAIConversationAPIEntry[],OpenAIConversationOption,AnyOpenAIChatApiRespFormat>={
    formatOption(opt:ChatTaskOption,model:string){
        //验证参数
        if(opt.messages==null){
            SLogger.warn("TurboOptions 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("TurboOptions 无效 messages长度不足");
            return;
        }

        let turboMessahge = OpenAIConversationChatFormatter.transReq(opt.target,opt.messages);
        turboMessahge = OpenAIConversationChatFormatter.formatReq(opt.target,turboMessahge);

        return {
            model             : model as OpenAIConversationModel,//模型id
            messages          : turboMessahge           ,//提示
            max_tokens        : opt.max_tokens          ,//最大生成令牌数
            temperature       : opt.temperature         ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p               ,//top_p       权重控制 0为最准确 越大越偏离主题
            n                 : opt.n                   ,//产生n条消息
            presence_penalty  : opt.presence_penalty    ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : opt.frequency_penalty   ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            logit_bias        : opt.logit_bias          ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            //best_of         : best_of                 ,//产生n条候选消息，根据n返回n条最佳消息
            stop              : opt.stop                ,//调整某token出现的概率 {"tokenid":-100~100}
        };

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(OpenAIConversationChatFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcToken(OpenAIConversationChatFormatter)),
    transReq(chatTarget,messageList){
        const narr:OpenAIConversationAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                narr.push({
                    role:OpenAIConversationAPIRole.System,
                    content:item.content
                });
            }else{
                narr.push({
                    role:OpenAIConversationAPIRole.System,
                    content:item.name+":"
                });
                if(item.name==chatTarget){
                    narr.push({
                        role:OpenAIConversationAPIRole.Assistant,
                        content:item.content
                    });
                }else{
                    narr.push({
                        role:OpenAIConversationAPIRole.User,
                        content:item.content
                    });
                }
            }
        }

        //处理临时提示
        if(messageList.getTemporaryPrompt().length>0)
            narr[narr.length-1].content += messageList.getTemporaryPrompt();

        return narr;
    },
    formatReq(chatTarget,chatList){
        chatList.push({
            role:OpenAIConversationAPIRole.System,
            content:`${chatTarget}:`,
        });
        return chatList;
    },
    formatResp:(resp)=>{
        const choices = resp.choices
            .filter(choice => choice ?.message?.content!=undefined)
            .map(choice => ({content:choice .message.content!}));
        return {
            choices,
            vaild:choices.length>0
        }
    }
}

