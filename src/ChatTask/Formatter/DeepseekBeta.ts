import { SLogger, memoizeGetter } from "@zwa73/utils";
import { DeepseekChatModel } from "ModelConfig";
import { ChatTaskFormatter } from "../ChatFormatAdapter";
import { AnyDeepseekChatRespFormat } from "RespFormat";
import { ChatTaskOption, MessageType } from "@/src/ChatTask/ChatTaskInterface";
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { OpenAIConversationChatFormatter } from "./OpenAIConversation";
import { DeepseekChatAPIEntry, DeepseekChatAPIRole, DeepseekChatOption } from "./Deepseek";



/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**前缀续写模式的Formater */
export const DeepseekBetaChatTaskFormatter:ChatTaskFormatter<DeepseekChatAPIEntry[],DeepseekChatOption,AnyDeepseekChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):DeepseekChatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("DeepseekChatOptions 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("DeepseekChatOptions 无效 messages长度不足");
            return;
        }

        let msg = DeepseekBetaChatTaskFormatter.transReq(opt.target,opt.messages);
        msg = DeepseekBetaChatTaskFormatter.formatReq(opt.target,msg);


        return {
            model             : model as DeepseekChatModel  ,//模型id
            messages          : msg                         ,//提示
            max_tokens        : opt.max_tokens              ,//最大生成令牌数
            temperature       : opt.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : opt.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : opt.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : opt.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        };

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:memoizeGetter(()=>commonFormatResp(DeepseekBetaChatTaskFormatter)),
    calcToken:memoizeGetter(()=>stringifyCalcToken(DeepseekBetaChatTaskFormatter)),
    transReq(chatTarget,messageList){
        const narr:DeepseekChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                narr.push({
                    role:DeepseekChatAPIRole.System,
                    content:item.content
                });
            }else{
                if(item.name==chatTarget){
                    narr.push({
                        role:DeepseekChatAPIRole.Assistant,
                        content:item.name+":"+item.content
                    });
                }else{
                    narr.push({
                        role:DeepseekChatAPIRole.User,
                        content:item.name+":"+item.content
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
        const out:DeepseekChatAPIEntry[] = [
            ...chatList,
            {
                role:DeepseekChatAPIRole.Assistant,
                content:chatTarget+":",
                prefix:true
            }
        ];
        return out;
    },
    formatResp:OpenAIConversationChatFormatter.formatResp,
}
