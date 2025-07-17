import { lazyFunction, SLogger } from "@zwa73/utils";
import { DeepseekModel } from "ModelConfig";
import { ChatTaskFormatter } from "../ChatFormatAdapter";
import { AnyDeepseekChatRespFormat } from "ResponseFormat";
import { ChatTaskOption } from "@/src/ChatTask/ChatTaskInterface";
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { DeepseekAPIEntry, DeepseekOption } from "RequestFormat";
import { OpenAIConversationChatFormatter } from "./OpenAIConversation";




/**传统OpenAI系统提示模式的Formater */
export const DeepseekChatTaskFormatter:ChatTaskFormatter<DeepseekAPIEntry[],DeepseekOption,AnyDeepseekChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):DeepseekOption|undefined{
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
            model             : model as DeepseekModel  ,//模型id
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
    formatResult:lazyFunction(()=>commonFormatResp(DeepseekChatTaskFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcToken(DeepseekChatTaskFormatter)),
    transReq:OpenAIConversationChatFormatter.transReq,
    formatReq:OpenAIConversationChatFormatter.formatReq,
    formatResp:OpenAIConversationChatFormatter.formatResp,
}