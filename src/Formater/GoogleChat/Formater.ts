import { SLogger } from "@zwa73/utils";
import { GoogleChatAPIEntry, GoogleChatChatTaskTool, GoogleChatCompatAPIEntry, GoogleChatCompatChatTaskTool} from './Tool';
import { GoogleChatModel } from 'ModelConfig';
import { AnyGoogleChatRespFormat,AnyOpenAIChatRespFormat } from "RespFormat";
import { commonFormatResp, stringifyCalcToken,ChatTaskOption } from "TextCompletion";
import { ChatTaskFormater } from "../ChatFormatAdapter";


export type GoogleChatOption={
    system_instruction:{parts:{text: string}},
    contents:GoogleChatAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
        thinkingBudget?: number|undefined;
    }
}

export const GoogleChatChatTaskFormater:ChatTaskFormater<GoogleChatOption,AnyGoogleChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):GoogleChatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatOption 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("GoogleChatOption 无效 messages长度不足");
            return;
        }

        let turboMessahge = GoogleChatChatTaskTool.transReq(opt.target,opt.messages);
        turboMessahge = GoogleChatChatTaskTool.formatReq(opt.target,turboMessahge);

        return {
            system_instruction:{parts:{text:turboMessahge.define}},
            contents:turboMessahge.message,
            generationConfig:{
                stopSequences:opt.stop??undefined,
                temperature:opt.temperature??undefined,
                maxOutputTokens:opt.max_tokens??undefined,
                topP:opt.top_p??undefined,
                thinkingBudget:opt.think_budget??undefined,
            }
        };
    },
    calcToken:stringifyCalcToken(GoogleChatChatTaskTool),
    formatResult:commonFormatResp(GoogleChatChatTaskTool),
};



/**gptge兼容api选项 */
export type GoogleChatCompatOption=Partial<{
    model: GoogleChatModel|any;
    messages: GoogleChatCompatAPIEntry[];
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
export const GoogleChatCompatChatTaskFormater:ChatTaskFormater<GoogleChatCompatOption,AnyOpenAIChatRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):GoogleChatCompatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatCompatOption 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("GoogleChatCompatOption 无效 messages长度不足");
            return;
        }

        let msg = GoogleChatCompatChatTaskTool.transReq(opt.target,opt.messages);
        msg = GoogleChatCompatChatTaskTool.formatReq(opt.target,msg);

        const obj:GoogleChatCompatOption = {
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
    formatResult:commonFormatResp(GoogleChatCompatChatTaskTool),
    calcToken:stringifyCalcToken(GoogleChatCompatChatTaskTool),
}