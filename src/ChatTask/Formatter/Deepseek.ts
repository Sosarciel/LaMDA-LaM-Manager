import { memoizeGetter, SLogger } from "@zwa73/utils";
import { DeepseekChatModel } from "ModelConfig";
import { ChatTaskFormatter } from "../ChatFormatAdapter";
import { AnyDeepseekChatRespFormat } from "RespFormat";
import { ChatTaskOption } from "@/src/ChatTask/ChatTaskInterface";
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { OpenAIConversationAPIRole, OpenAIConversationChatFormatter } from "./OpenAIConversation";


/**Deepseek模型配置 */
export type DeepseekChatOption=Partial<{
    model: DeepseekChatModel;
    messages: DeepseekChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
}>;

/**用于Deepseek模型的消息Entry */
export type DeepseekChatAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
    /**指定为前缀补全模式 */
    prefix?:boolean;
}

export const DeepseekChatAPIRole = OpenAIConversationAPIRole;
export type DeepseekChatAPIRole = OpenAIConversationAPIRole;

/**传统OpenAI系统提示模式的Formater */
export const DeepseekChatTaskFormatter:ChatTaskFormatter<DeepseekChatAPIEntry[],DeepseekChatOption,AnyDeepseekChatRespFormat> = {
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

        let msg = DeepseekChatTaskFormatter.transReq(opt.target,opt.messages);
        msg = DeepseekChatTaskFormatter.formatReq(opt.target,msg);


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
    formatResult:memoizeGetter(()=>commonFormatResp(DeepseekChatTaskFormatter)),
    calcToken:memoizeGetter(()=>stringifyCalcToken(DeepseekChatTaskFormatter)),
    transReq:OpenAIConversationChatFormatter.transReq,
    formatReq:OpenAIConversationChatFormatter.formatReq,
    formatResp:OpenAIConversationChatFormatter.formatResp,
}