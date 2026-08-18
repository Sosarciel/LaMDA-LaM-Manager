import { None, SLogger } from "@zwa73/utils";

import { CredManager } from "CredService";
import type { ChatTaskFormatter, TextCompletionOption } from "Task";
import { ChatTaskFormatterTable } from "Task";
import { getTokensizer } from "Tokensizer";

import { DefaultDrive } from "ModelDrive/DefaultDrive";
import type { HttpAPIModelData } from "ModelDrive/HttpApiModel/Interface";
import type { LaMDrive, LaMDriveDefaultOption } from "ModelDrive/Interface";
import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import { InstructTaskFormatterTable } from "Task/Instruct/Adapter";

import { chatTaskCtor } from "./ChatTask";
import { instructTaskCtor } from "./InstructTask";

/**适用于网络API的文本完成模型驱动器 */
export class HttpAPIModelDrive extends DefaultDrive implements LaMDrive{
    chatFormatter:ChatTaskFormatter<any,any,any>;
    instructFormatter?:InstructTaskFormatter<any,any>;
    chat = chatTaskCtor(this);
    instruct = instructTaskCtor(this);
    constructor(private data:HttpAPIModelData){
        super();
        this.chatFormatter = ChatTaskFormatterTable[this.data.config.chat_formatter];
        this.instructFormatter = this.data.config.instruct_formatter ? InstructTaskFormatterTable[this.data.config.instruct_formatter] : undefined;
    }
    isRuning(){return true;}
    getData(){return this.data;}
    getDefaultOption():LaMDriveDefaultOption{
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

    /**选择有效凭证 (仅负责路由账户, 不执行请求)
     * @param option - 用于偏好账户的选项
     */
    async selectAccount(option:TextCompletionOption){
        //路由api key 获取有效keyname
        const vaildAccount = await CredManager.getVaildModelAccount(this.data.config.alias);
        const accountData = await CredManager.getAvailableAccount(
            ...(option.preferred_account??[]).filter(v=>vaildAccount.includes(v)),
            ...vaildAccount
        );
        if(accountData==None){
            SLogger.warn(`HttpAPIModelDrive.selectAccount 错误 无有效账号`);
            return undefined;
        }
        SLogger.info(`当前 account_category: ${accountData.cred.category} account_name: ${accountData.cred.name}`);
        return accountData;
    }
}
