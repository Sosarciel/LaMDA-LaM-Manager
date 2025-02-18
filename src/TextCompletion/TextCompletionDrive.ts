import { APIPrice, CredsAdapter, CredsType } from "CredsAdapter";
import { LaMInterface } from "../LaMInterface";
import { ChatFormaterTable, ChatFormaterType, IChatFormater } from "./ChatFormatAdapter";
import { getTokensizer, TokensizerType } from "../Tokensize";
import { ChatTaskOption, LaMChatMessages } from "./ChatTaskInterface";
import { DefChatLaMResult } from "./TextCompletionInterface";
import { None, SLogger, UtilFunc } from "@zwa73/utils";
import { RequestFormaterTable, RequestFormaterType } from "../RequestFormatAdapter";
import { IRequestFormater } from "../RequestFormatAdapter/RequestFormatInterface";



/**文本完成模型驱动器 */
export class TextCompleteionModel implements LaMInterface{
    chatFormater:IChatFormater;
    requestFormater:IRequestFormater;
    constructor(private data:TextCompleteionModelData){
        this.chatFormater = ChatFormaterTable[this.data.chat_formater];
        this.requestFormater = RequestFormaterTable[this.data.request_formater];
    }
    isRuning(){return true;}
    getData(){return {};}
    async calcToken(message: LaMChatMessages) {
        return this.chatFormater.calcToken(message,this.data.tokensizer);
    }
    async decodeToken(arr: number[]) {
        const tokenizer = getTokensizer(this.data.tokensizer);
        return tokenizer.decode(arr);
    }
    async encodeToken(str: string) {
        const tokenizer = getTokensizer(this.data.tokensizer);
        return tokenizer.encode(str);
    }
    async chat(opt: ChatTaskOption) {
        //路由api key 获取有效keyname
        const accountData = await CredsAdapter.getAvailableAccount(
            ...opt.preferred_account,...this.data.valid_account);
        if(accountData==None){
            SLogger.warn(`DeepseekChat.chat 错误 无有效账号`);
            return DefChatLaMResult;
        }
        SLogger.info(`当前 account_type: ${accountData.type} account_name: ${accountData.name}`);

        const chatOption = await this.chatFormater.formatOption(opt,this.data.id);
        if(chatOption===undefined) return DefChatLaMResult;

        opt.logLevel??='http';
        if(opt.logLevel!='none'){
            SLogger.log(opt.logLevel,UtilFunc.stringifyJToken(chatOption,{compress:true,space:2}));
        }

        //重复请求
        const resp = await this.requestFormater.postLaMRepeat({
            accountData,
            postJson:chatOption,
            modelData:this.data,
        });
        return this.chatFormater.formatResp(resp);
    }
}

/**文本生成模型数据 */
export type TextCompleteionModelData = {
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