import { PromiseRetryResult, SLogger } from "@zwa73/utils";
import { DeepseekChatModel } from "./DeepseekChatInterface";
import { AnyTextCompletionRespFormat, DefChatLaMResult } from "@/TextCompletion/TextCompletionInterface";
import { ChatTaskOption, LaMChatMessages } from '@/TextCompletion/ChatTaskInterface';
import { IChatFormater } from "@/TextCompletion/ChatFormatAdapter";
import { getTokensizer, TokensizerType } from "@/src/Tokensize";
import { DeepseekChatAPIEntry, DeepseekChatBetaChatTaskTool, DeepseekChatChatTaskTool } from "./Tool";


/**Deepseek模型配置 */
export type DeepseekChatOption={
    model: DeepseekChatModel;
    messages: DeepseekChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
}

/**传统OpenAI系统提示模式的Formater */
export const DeepseekChatChatTaskFormater:IChatFormater = {
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

        let msg = DeepseekChatChatTaskTool.transReq(opt.target,opt.messages);
        msg = DeepseekChatChatTaskTool.formatReq(opt.target,msg);


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
    formatResp(resp:PromiseRetryResult<AnyTextCompletionRespFormat | undefined> | undefined){
        if(resp==null) return DefChatLaMResult;
        return {
            completed:resp.completed ? DeepseekChatChatTaskTool.formatResp(resp.completed) : undefined,
            pending:resp.pending.map(async p=>{
                const res = await p;
                if(res==null) return undefined;
                return DeepseekChatChatTaskTool.formatResp(res);
            })
        };
    },
    async calcToken(message: LaMChatMessages, tokensizerType: TokensizerType) {
        const turboMessage = DeepseekChatChatTaskTool.transReq('unknown',message);
        const tokenizer = getTokensizer(tokensizerType);
        return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
    }
}

/**前缀续写模式的Formater */
export const DeepseekChatBetaChatTaskFormater:IChatFormater = {
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

        let msg = DeepseekChatBetaChatTaskTool.transReq(opt.target,opt.messages);
        msg = DeepseekChatBetaChatTaskTool.formatReq(opt.target,msg);


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
    formatResp:DeepseekChatChatTaskFormater.formatResp,
    calcToken:DeepseekChatChatTaskFormater.calcToken,
}