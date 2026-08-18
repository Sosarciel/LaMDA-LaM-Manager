import { ivk, None, SLogger, UtilFunc } from "@zwa73/utils";

import { CredManager } from "CredService";
import type { Interactor } from "Interactor";
import { InteractorTable } from "Interactor";
import type { ChatTaskFormatter, TextCompletionOption, TextCompletionTaskFormatter } from "Task";
import { ChatTaskFormatterTable, DefChatLaMResult } from "Task";
import { getTokensizer } from "Tokensizer";

import { DefaultDrive } from "ModelDrive/DefaultDrive";
import type { HttpAPIModelData } from "ModelDrive/HttpApiModel/Interface";
import type { LaMDrive } from "ModelDrive/Interface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import { InstructTaskFormatterTable } from "Task/Instruct/Adapter";

import { chatTaskCtor } from "./ChatTask";
import { instructTaskCtor } from "./InstructTask";

/**适用于网络API的文本完成模型驱动器 */
export class HttpAPIModelDrive extends DefaultDrive implements LaMDrive{
    chatFormatter:ChatTaskFormatter<any,any,any>;
    instructFormatter?:InstructTaskFormatter<any,any>;
    interactor  :Interactor;
    chat = chatTaskCtor(this);
    instruct = instructTaskCtor(this);
    constructor(private data:HttpAPIModelData){
        super();
        this.chatFormatter = ChatTaskFormatterTable[this.data.config.chat_formatter];
        this.instructFormatter = this.data.config.instruct_formatter ? InstructTaskFormatterTable[this.data.config.instruct_formatter] : undefined;
        this.interactor   = InteractorTable[this.data.config.interactor];
    }
    isRuning(){return true;}
    getData(){return this.data;}
    getDefaultOption():TextCompletionOption{
        return this.data.default_option??{};
    }

    async decodeToken(arr: number[]) {
        const tokenizer = getTokensizer(this.data.config.tokensizer);
        return tokenizer.decode(arr);
    }
    async encodeToken(str: string) {
        const tokenizer = getTokensizer(this.data.config.tokensizer);
        return tokenizer.encode(str);
    }

    /**task共用请求 */
    async commonTask(opt:TextCompletionOption,formatter:TextCompletionTaskFormatter<any,any,any>){
        //路由api key 获取有效keyname
        const vaildAccount = await CredManager.getVaildModelAccount(this.data.config.alias);
        const accountData = await CredManager.getAvailableAccount(
            ...(opt.preferred_account??[]).filter(v=>vaildAccount.includes(v)),
            ...vaildAccount
        );

        if(accountData==None){
            SLogger.warn(`HttpAPIModelDrive.commonTask 错误 无有效账号`);
            return DefChatLaMResult;
        }
        const {cred,source} = accountData;

        SLogger.info(`当前 account_category: ${cred.category} account_name: ${cred.name}`);

        const chatOption = await formatter.formatOption({
            option:opt,
            modelId:this.data.config.id,
            tokensizerType:this.data.config.tokensizer
        });
        if(chatOption===undefined) return DefChatLaMResult;

        //预处理option
        const fixedOption = ivk(()=>{
            const out:unknown = {...chatOption};
            if(UtilFunc.checkSharpSchema(out,{model:"string"})){
                //如果存在id映射则直接替换opt的model
                const mapname = source.modelIdMap?.[out.model];
                if(mapname!=null) out.model = mapname;
            }
            return out as any;
        });
        if(fixedOption===undefined) return DefChatLaMResult;

        if(opt.log_level!='none'){
            SLogger.log(opt.log_level??'none',`参数: ${UtilFunc.stringifyJToken(fixedOption,{compress:true,space:2})}`);
        }

        //重复请求
        const resp = await this.interactor.postLaMRepeat({
            cred,source,
            postJson:fixedOption,
            modelData:this.data.config,
            retryOption:UtilFunc.camelToSnake(source.retry),
        });
        return formatter.formatResult(resp);
    }
}
