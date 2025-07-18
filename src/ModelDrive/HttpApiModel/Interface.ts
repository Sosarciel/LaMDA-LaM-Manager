import { APIPrice, CredCategoryID } from "CredService";
import { ChatFormaterType } from "ChatTask";
import { RequestFormaterType } from "Requester";
import { TextCompletionOptions } from "TextCompletion";
import { TokensizerType } from "Tokensizer";




/**适用于网络API的文本完成模型数据 */
export type HttpAPIModelData = {
    /**默认请求选项 */
    default_option?: TextCompletionOptions;
    ///**模型配置 */
    config:HttpApiModelCategory;
}

/**适用于网络API的文本完成模型类别配置 */
export type HttpApiModelCategory = {
    /**模型id */
    id: string;
    /**模型别名 */
    alias: string[]|string;
    /**此模型api的标准路径 */
    endpoint:string;
    /**支持此模型的账号, 优先度排序 */
    valid_account:CredCategoryID[];
    /**此模型的官方价格 */
    price:APIPrice;
    /**此模型的聊天任务格式化工具 */
    chat_formater:ChatFormaterType;
    /**此模型的交互器 */
    interactor:RequestFormaterType;
    /**此模型所用的分词器 */
    tokensizer:TokensizerType;
}