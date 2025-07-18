import { APIPrice, CredsManager, CredsType } from "@sosraciel-lamda/creds-manager";
import { LaMInterface } from "LaMService";
import { getTokensizer, TokensizerType } from "Tokensizer";
import { DefChatLaMResult, TextCompletionOptions } from "TextCompletion";
import { None, SLogger, UtilFunc } from "@zwa73/utils";
import { IRequestFormater, RequestFormaterTable, RequestFormaterType } from "Interactor";
import { ChatTaskFormaterTable, ChatFormaterType, ChatTaskFormatter, LaMChatMessages, ChatTaskOption } from "ChatTask";




export type TextCompleteionModelData = {
    /**默认请求选项 */
    default_option?: TextCompletionOptions;
}

/**文本完成模型驱动器 */
export class TextCompleteionModel implements LaMInterface{
    chatFormater:ChatTaskFormatter<any,any,any>;
    requestFormater:IRequestFormater;
    constructor(private data:TextCompleteionModelData, private config:TextCompleteionModelConfig){
        this.chatFormater = ChatTaskFormaterTable[this.config.chat_formater];
        this.requestFormater = RequestFormaterTable[this.config.request_formater];
    }
    isRuning(){return true;}
    getData(){return this.data;}
    async calcToken(message: LaMChatMessages) {
        return this.chatFormater.calcToken(message,this.config.tokensizer);
    }
    async decodeToken(arr: number[]) {
        const tokenizer = getTokensizer(this.config.tokensizer);
        return tokenizer.decode(arr);
    }
    async encodeToken(str: string) {
        const tokenizer = getTokensizer(this.config.tokensizer);
        return tokenizer.encode(str);
    }
    async chat(opt: ChatTaskOption) {
        //路由api key 获取有效keyname
        const accountData = await CredsManager.getAvailableAccount(
            ...opt.preferred_account,...this.config.valid_account);
        if(accountData==None){
            SLogger.warn(`DeepseekChat.chat 错误 无有效账号`);
            return DefChatLaMResult;
        }
        SLogger.info(`当前 account_type: ${accountData.type} account_name: ${accountData.name}`);

        const chatOption = await this.chatFormater.formatOption(opt,this.config.id);
        if(chatOption===undefined) return DefChatLaMResult;
        const fixedOption = accountData.instance.postOption.procOption
            ? accountData.instance.postOption.procOption(chatOption)
            : chatOption;
        if(fixedOption===undefined) return DefChatLaMResult;

        opt.logLevel??='http';
        if(opt.logLevel!='none'){
            SLogger.log(opt.logLevel,`参数: ${UtilFunc.stringifyJToken(fixedOption,{compress:true,space:2})}`);
        }

        //重复请求
        const resp = await this.requestFormater.postLaMRepeat({
            accountData,
            postJson:fixedOption,
            modelData:this.config,
            retryOption:accountData.instance.postOption.retryOption,
        });
        return this.chatFormater.formatResult(resp);
    }
    getDefaultOption():TextCompletionOptions{
        return this.data.default_option??{};
    }
}

/**文本生成模型配置 */
export type TextCompleteionModelConfig = {
    /**模型id */
    readonly id: string;
    /**模型别名 */
    readonly alias: ReadonlyArray<string>|string;
    /**此模型api的标准路径 */
    readonly endpoint:string;
    /**支持此模型的账号, 优先度排序 */
    readonly valid_account:ReadonlyArray<CredsType>;
    /**此模型的官方价格 */
    readonly price:APIPrice;
    /**此模型的聊天格式适配器 */
    readonly chat_formater:ChatFormaterType;
    /**此模型的请求格式适配器 */
    readonly request_formater:RequestFormaterType;
    /**此模型所用的分词器 */
    readonly tokensizer:TokensizerType;
}