import { lazyFunction, SLogger } from "@zwa73/utils";
import { ChatTaskFormatter } from "../Adapter";
import { OpenAITextRespFormat } from "ResponseFormat";
import { commonCalcToken, commonFormatResp } from "./Utils";
import { ChatTaskOption, MessageType } from "../Interface";
import { OpenAITextOption } from "RequestFormat";


export const OpenAITextChatTaskFormatter:ChatTaskFormatter<string,OpenAITextOption,OpenAITextRespFormat>={
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
        //转换文本
        let turboMessahge = OpenAITextChatTaskFormatter.transReq(opt.target,opt.messages);
        turboMessahge = OpenAITextChatTaskFormatter.formatReq(opt.target,turboMessahge);


        return {
            model             : model                    ,//模型id
            prompt            : turboMessahge            ,//提示
            max_tokens        : opt.max_tokens           ,//最大生成令牌数
            temperature       : opt.temperature          ,//temperature 权重控制 0为最准确 越大越偏离主题
            top_p             : opt.top_p                ,//top_p       权重控制 0为最准确 越大越偏离主题
            n                 : opt.n                    ,//产生n条消息
            presence_penalty  : opt.presence_penalty     ,//重复惩罚 alpha_presence  越大越不容易生成重复词 重复出现时的固定惩罚
            frequency_penalty : opt.frequency_penalty    ,//重复惩罚 alpha_frequency 越大越不容易生成重复词 每次重复时的累计惩罚
            logit_bias        : opt.logit_bias           ,//调整某token出现的概率 {"tokenid":-100~100}
            //best_of         : best_of                  ,//产生n条候选消息，根据n返回n条最佳消息
            stop              : opt.stop                 ,//遭遇时将会停止生成的最多4个字符串 "1234"
        };

        //频率惩罚计算函数
        //mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
    },
    formatResult:lazyFunction(()=>commonFormatResp(OpenAITextChatTaskFormatter)),
    calcToken:lazyFunction(()=>commonCalcToken(OpenAITextChatTaskFormatter)),
    transReq(chatTarget,messageList){
        let ntext="";

        //处理主消息列表
        for(const item of messageList){
            ntext=item.type==MessageType.DESC
            ? `${ntext}\n${item.content}`
            : `${ntext}\n${item.name}:${item.content}`;
        }

        //处理临时提示
        if(messageList.getTemporaryPrompt().length>0)
            ntext += messageList.getTemporaryPrompt();

        return ntext.trim();
    },
    formatReq(chatTarget,chatText){
        return `${chatText}\n${chatTarget}:`;
    },
    formatResp:(resp)=>{
        // 提取 choices 列表
        const choices = resp.choices
            .filter(choice => choice?.text != undefined)
            .map(choice => ({ content: choice.text }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
};

//void (async ()=>{
//    console.log(await OpenAITextChatFormater.calcToken(new LaMChatMessages({
//        type:MessageType.DESC,
//        content:"你好，我的民资是"
//    }),"deepseek"))
//})();
