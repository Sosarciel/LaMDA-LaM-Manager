import { SLogger } from "@zwa73/utils";
import { GeminiCompatChatAPIEntry, GeminiChatCompatChatTaskTool} from './Tool';
import { GoogleChatModel } from 'ModelConfig';
import { AnyOpenAIChatRespFormat } from "RespFormat";
import { ChatTaskFormater } from "../ChatFormatAdapter";
import { commonFormatResp, stringifyCalcToken } from "../Utils";
import { ChatTaskOption } from "@/src/ChatTask/ChatTaskInterface";


/**gptge兼容api选项 */
export type GeminiCompatChatOption=Partial<{
    model: GoogleChatModel|any;
    messages: GeminiCompatChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
    thinking:{
        type: "enabled",
        budget_tokens: number,
    }
}>;

/**gptge兼容api格式化工具 */
export const GeminiCompatChatTaskFormater:ChatTaskFormater<GeminiCompatChatOption,AnyOpenAIChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):GeminiCompatChatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatCompatOption 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("GoogleChatCompatOption 无效 messages长度不足");
            return;
        }

        let msg = GeminiChatCompatChatTaskTool.transReq(opt.target,opt.messages);
        msg = GeminiChatCompatChatTaskTool.formatReq(opt.target,msg);

        const obj:GeminiCompatChatOption = {
            model             : model as GoogleChatModel    ,//模型id
            messages          : msg                         ,//提示
            max_tokens        : opt.max_tokens              ,//最大生成令牌数
            temperature       : opt.temperature             ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                   ,//top_p       权重控制 0为最准确 越大越偏离主题
            presence_penalty  : opt.presence_penalty        ,//遭遇时将会停止生成的最多4个字符串 "1234"
            frequency_penalty : opt.frequency_penalty       ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            stop              : opt.stop                    ,//调整某token出现的概率 {"tokenid":-100~100}
        };
        if(opt.think_budget!=null){
            obj.thinking = {
                type: "enabled",
                budget_tokens: opt.think_budget
            };
        }
        return obj;
    },
    formatResult:commonFormatResp(GeminiChatCompatChatTaskTool),
    calcToken:stringifyCalcToken(GeminiChatCompatChatTaskTool),
}