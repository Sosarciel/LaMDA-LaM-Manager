import type { ModelInfo, TokensizerType } from "@sosraciel-lamda/lam-chain";

import type { ChatFormatterType } from "Task";

import type { LaMDriveDefaultOption } from "ModelDrive/Interface";
import type { InstructFormatterType } from "Task/Instruct/Adapter";




/**适用于网络API的文本完成模型数据 */
export type HttpAPIModelData = {
    /**默认请求选项 */
    default_option?: (LaMDriveDefaultOption);
    ///**模型配置 */
    config:HttpApiModelCategory;
}



/**适用于网络API的文本完成模型类别配置 */
export type HttpApiModelCategory = ModelInfo&{
    /**模型别名 */
    alias: string[]|string;
    /**此模型的聊天任务格式化工具 */
    chat_formatter:(ChatFormatterType);
    /**此模型的指导式文本生成任务格式化工具 */
    instruct_formatter?: (InstructFormatterType);
    /**此模型所用的分词器 */
    tokensizer:(TokensizerType);
}