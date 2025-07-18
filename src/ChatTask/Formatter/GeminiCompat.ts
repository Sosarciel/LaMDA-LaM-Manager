import { lazyFunction, SLogger } from "@zwa73/utils";
import { ChatTaskFormatter } from "../Adapter";
import { commonFormatResp, stringifyCalcToken } from "./Utils";
import { ChatTaskOption, MessageType } from "../Interface";
import { OpenAIConversationAPIRole,GeminiCompatAPIEntry, GeminiCompatOption } from "RequestFormat";
import { OpenAIConversationRespFormat } from "ResponseFormat";
import { OpenAIConversationChatTaskFormatter } from "./OpenAIConversation";


/**gptge兼容api格式化工具 */
export const GeminiCompatChatTaskFormatter:ChatTaskFormatter<GeminiCompatAPIEntry[],GeminiCompatOption,OpenAIConversationRespFormat> = {
    formatOption(opt:ChatTaskOption,model:string):GeminiCompatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("GoogleChatCompatOption 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("GoogleChatCompatOption 无效 messages长度不足");
            return;
        }

        let msg = GeminiCompatChatTaskFormatter.transReq(opt.target,opt.messages);
        msg = GeminiCompatChatTaskFormatter.formatReq(opt.target,msg);

        const obj:GeminiCompatOption = {
            model             : model                       ,//模型id
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
    formatResult:lazyFunction(()=>commonFormatResp(GeminiCompatChatTaskFormatter)),
    calcToken:lazyFunction(()=>stringifyCalcToken(GeminiCompatChatTaskFormatter)),
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GeminiCompatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                /**应对以下转换方式 需合并system
                 *  for _, message := range textRequest.Messages {
                 *      if messageLink.Role == "system" {
                 *          geminiRequest.Systeminstruction = &ChatContent{
                 *              Parts: []Part{ { Text: messageLink.StringContent() } }
                 *          }
                 *          continue
                 *      }
                 *  }
                 */
                //头部说明直接合并 gptge兼容仅支持一条system提示
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
                    narr.push({
                        role:OpenAIConversationAPIRole.User,
                        content:item.content
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:OpenAIConversationAPIRole.User,
                    content:item.name+":"
                });

                //为目标则视为模型输出
                if(item.name==chatTarget){
                    narr.push({
                        role:OpenAIConversationAPIRole.Assistant,
                        content:item.content
                    });
                }
                //其他视为用户输入
                else{
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

        return [{role:OpenAIConversationAPIRole.System,content:desc.trim()},...narr];
    },
    formatReq(chatTarget,chatList){
        chatList.push({
            role:OpenAIConversationAPIRole.User,
            content:`${chatTarget}:`,
        });
        return chatList;
    },
    formatResp:OpenAIConversationChatTaskFormatter.formatResp,
}