import { PromiseRetryResult, SLogger } from "@zwa73/utils";
import { DeepseekChatModel } from "./DeepseekChatInterface";
import { AnyOpenAIChatApiRespFormat, AnyTextCompletionRespFormat, DefChatLaMResult } from "../../TextCompletionInterface";
import { OpenAIChatAPIEntry, OpenAIChatAPIResp, formatOpenAIChatApiReq, transOpenAIChatApiReq } from "../../../APITool";
import { ChatTaskOption, LaMChatMessages } from '../../ChatTaskInterface';
import { IChatFormater } from "../../ChatFormatAdapter";
import { getTokensizer, TokensizerType } from "@/src/LaMAdapter/Tokensize";


/**Deepseek模型配置 */
export type DeepseekChatOption={
    model: DeepseekChatModel;
    messages: OpenAIChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
}

class _DeepseekChatFormater implements IChatFormater{
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

        let msg = transOpenAIChatApiReq(opt.target,opt.messages);
        msg = formatOpenAIChatApiReq(opt.target,msg);


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
    }
    formatResp(resp:PromiseRetryResult<AnyTextCompletionRespFormat | undefined> | undefined){
        if(resp==null) return DefChatLaMResult;
        return {
            completed:resp.completed ? new OpenAIChatAPIResp(resp.completed as AnyOpenAIChatApiRespFormat) : undefined,
            pending:resp.pending.map(async p=>{
                const res = await p;
                if(p==null) return undefined;
                return new OpenAIChatAPIResp(res as AnyOpenAIChatApiRespFormat);
            })
        };
    };
    async calcToken(message: LaMChatMessages, tokensizerType: TokensizerType) {
        const turboMessage = transOpenAIChatApiReq('unknown',message);
        const tokenizer = getTokensizer(tokensizerType);
        return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
    }
}
export const DeepseekChatFormater = new _DeepseekChatFormater();