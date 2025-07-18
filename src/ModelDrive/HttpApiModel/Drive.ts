import { CredManager } from "CredService";
import { LaMInterface } from "LaMService";
import { getTokensizer } from "Tokensizer";
import { DefChatLaMResult, TextCompletionOptions } from "TextCompletion";
import { ivk, None, SLogger, UtilFunc } from "@zwa73/utils";
import { IRequestFormater, RequestFormaterTable } from "Interactor";
import { ChatTaskFormaterTable, ChatTaskFormatter, LaMChatMessages, ChatTaskOption } from "ChatTask";
import { HttpApiModelCategory, HttpAPIModelData } from "./Interface";


/**适用于网络API的文本完成模型驱动器 */
export class HttpAPIModelDrive implements LaMInterface{
    chatFormater:ChatTaskFormatter<any,any,any>;
    requestFormater:IRequestFormater;
    constructor(private data:HttpAPIModelData){
        this.chatFormater = ChatTaskFormaterTable[this.data.config.chat_formater];
        this.requestFormater = RequestFormaterTable[this.data.config.interactor];
    }
    isRuning(){return true;}
    getData(){return this.data;}
    async calcToken(message: LaMChatMessages) {
        return this.chatFormater.calcToken(message,this.data.config.tokensizer);
    }
    async decodeToken(arr: number[]) {
        const tokenizer = getTokensizer(this.data.config.tokensizer);
        return tokenizer.decode(arr);
    }
    async encodeToken(str: string) {
        const tokenizer = getTokensizer(this.data.config.tokensizer);
        return tokenizer.encode(str);
    }
    async chat(opt: ChatTaskOption) {
        //路由api key 获取有效keyname
        const accountData = await CredManager.getAvailableAccount(
            ...opt.preferred_account,...this.data.config.valid_account);
        if(accountData==None){
            SLogger.warn(`DeepseekChat.chat 错误 无有效账号`);
            return DefChatLaMResult;
        }
        SLogger.info(`当前 account_category: ${accountData.instance.getData().cred_category} account_name: ${accountData.name}`);

        const chatOption = await this.chatFormater.formatOption(opt,this.data.config.id);
        if(chatOption===undefined) return DefChatLaMResult;
        const fixedOption = ivk(()=>{
            const out = {...chatOption};
            if('model' in out && typeof out.model === 'string'){
                const mapname = accountData.instance.categoryData.model_id_map?.[out.model];
                if(mapname!=null) out.model = mapname;
            }
            return out;
        });
        if(fixedOption===undefined) return DefChatLaMResult;

        opt.logLevel??='http';
        if(opt.logLevel!='none'){
            SLogger.log(opt.logLevel,`参数: ${UtilFunc.stringifyJToken(fixedOption,{compress:true,space:2})}`);
        }

        //重复请求
        const resp = await this.requestFormater.postLaMRepeat({
            accountData,
            postJson:fixedOption,
            modelData:this.data.config,
            retryOption:accountData.instance.categoryData.retry,
        });
        return this.chatFormater.formatResult(resp);
    }
    getDefaultOption():TextCompletionOptions{
        return this.data.default_option??{};
    }
}