import { CredManager } from "CredService";
import { getTokensizer } from "Tokensizer";
import { ivk, None, SLogger, UtilFunc } from "@zwa73/utils";
import { Interactor, InteractorTable } from "Interactor";
import { ChatTaskFormaterTable, ChatTaskFormatter, LaMChatMessages, DefChatLaMResult, TextCompletionOption, TextCompletionTaskFormatter, ChatTaskInterface } from "Task";
import { HttpAPIModelData } from "./Interface";
import { LaMDrive } from "../Interface";
import { chatTaskCtor } from "./ChatTask";
import { DefaultDrive } from "../DefaultDrive";


/**适用于网络API的文本完成模型驱动器 */
export class HttpAPIModelDrive extends DefaultDrive implements LaMDrive{
    chatFormater:ChatTaskFormatter<any,any,any>;
    interactor  :Interactor;
    chat = chatTaskCtor(this);
    constructor(private data:HttpAPIModelData){
        super();
        this.chatFormater = ChatTaskFormaterTable[this.data.config.chat_formater];
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
        const vaildAccount = this.data.config.valid_account;
        const accountData = await CredManager.getAvailableAccount(
            ...(opt.preferred_account??[]).filter(v=>vaildAccount.includes(v)),
            ...vaildAccount
        );

        if(accountData==None){
            SLogger.warn(`DeepseekChat.chat 错误 无有效账号`);
            return DefChatLaMResult;
        }
        SLogger.info(`当前 account_category: ${accountData.instance.getData().cred_category} account_name: ${accountData.name}`);

        const chatOption = await formatter.formatOption(opt,this.data.config.id);
        if(chatOption===undefined) return DefChatLaMResult;
        const fixedOption = ivk(()=>{
            const out:unknown = {...chatOption};
            if(UtilFunc.checkSharpSchema(out,{model:"string"})){
                const mapname = accountData.instance.categoryData.model_id_map?.[out.model];
                if(mapname!=null) out.model = mapname;
            }
            return out as any;
        });
        if(fixedOption===undefined) return DefChatLaMResult;

        if(opt.log_level!='none'){
            SLogger.log(opt.log_level,`参数: ${UtilFunc.stringifyJToken(fixedOption,{compress:true,space:2})}`);
        }

        //重复请求
        const resp = await this.interactor.postLaMRepeat({
            accountData,
            postJson:fixedOption,
            modelData:this.data.config,
            retryOption:accountData.instance.categoryData.retry,
        });
        return formatter.formatResult(resp);
    }
}