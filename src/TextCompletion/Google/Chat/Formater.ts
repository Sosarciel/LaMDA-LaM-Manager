import { AnyGoogleChatApiRespFormat, AnyTextCompletionRespFormat, DefChatLaMResult } from '../../TextCompletionInterface';
import { PromiseRetryResult, SLogger } from "@zwa73/utils";
import { transOpenAIChatApiReq } from "../../../APITool";
import { ChatTaskOption, LaMChatMessages } from '../../ChatTaskInterface';
import { IChatFormater } from '../../ChatFormatAdapter';
import { getTokensizer, TokensizerType } from '@/src/LaMAdapter/Tokensize';
import { formatGoogleChatApiReq, GoogleChatAPIEntry, GoogleChatAPIResp, transGoogleChatApiReq } from '@/src/LaMAdapter/APITool/GoogleChatAPI';


export type GoogleChatOption={
    system_instruction:{parts:{text: string}},
    contents:GoogleChatAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
    }
}

class _GoogleChatFormater implements IChatFormater{
    formatOption(opt:ChatTaskOption,model:string):GoogleChatOption|undefined{
        //验证参数
        if(opt.messages==null){
            SLogger.warn("TurboOptions 无效 messages为null");
            return;
        }
        if(opt.messages.length==0){
            SLogger.warn("TurboOptions 无效 messages长度不足");
            return;
        }

        let turboMessahge = transGoogleChatApiReq(opt.target,opt.messages);
        turboMessahge = formatGoogleChatApiReq(opt.target,turboMessahge);

        return {
            system_instruction:{parts:{text:turboMessahge.define}},
            contents:turboMessahge.message,
            generationConfig:{
                stopSequences:opt.stop??undefined,
                temperature:opt.temperature??undefined,
                maxOutputTokens:opt.max_tokens??undefined,
                topP:opt.top_p??undefined,
            }
        };
    }
    async calcToken(message: LaMChatMessages, tokensizerType: TokensizerType) {
        const turboMessage = transOpenAIChatApiReq('unknown',message);
        const tokenizer = getTokensizer(tokensizerType);
        return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
    }
    formatResp(resp:PromiseRetryResult<AnyTextCompletionRespFormat | undefined> | undefined){
        if(resp==null) return DefChatLaMResult;
        return {
            completed:resp.completed ? new GoogleChatAPIResp(resp.completed as AnyGoogleChatApiRespFormat) : undefined,
            pending:resp.pending.map(async p=>{
                const res = await p;
                if(p==null) return undefined;
                return new GoogleChatAPIResp(res as AnyGoogleChatApiRespFormat);
            })
        };
    };
}

export const GoogleChatFormater = new _GoogleChatFormater();
