import { SLogger } from "@zwa73/utils";
import { OpenAIChatModel } from "ModelConfig";
import { ChatTaskFormater } from '../ChatFormatAdapter';
import { OpenAIChatAPIEntry, OpenAIChatChatTaskTool } from './Tool';
import { commonFormatResp, stringifyCalcToken } from "../Utils";
import { AnyOpenAIChatApiRespFormat } from "RespFormat";
import { ChatTaskOption } from "@/src/ChatTask/ChatTaskInterface";

/**turbo模型配置 */
export type OpenAIChatChatOption=Partial<{
    model: OpenAIChatModel;
    messages: OpenAIChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
    logit_bias: Record<string, number>|null;
    n: number;
}>;

export const OpenAIChatChatFormater:ChatTaskFormater<OpenAIChatChatOption,AnyOpenAIChatApiRespFormat>={
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

        let turboMessahge = OpenAIChatChatTaskTool.transReq(opt.target,opt.messages);
        turboMessahge = OpenAIChatChatTaskTool.formatReq(opt.target,turboMessahge);

        return {
            model             : model as OpenAIChatModel,//模型id
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
    formatResult:commonFormatResp(OpenAIChatChatTaskTool),
    calcToken:stringifyCalcToken(OpenAIChatChatTaskTool),
}

