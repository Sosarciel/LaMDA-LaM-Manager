import type { ModelInfo } from "LaMChain";

import type { ChatFormatterType, TextCompletionOption } from "Task";
import type { TokensizerType } from "Tokensizer";

import type { InstructFormatterType } from "Task/Instruct/Adapter";




/**适用于网络API的文本完成模型数据 */
export type HttpAPIModelData = {
    /**默认请求选项 */
    default_option?: TextCompletionOption&ExpandSchemaOption;
    ///**模型配置 */
    config:HttpApiModelCategory;
}

/**用于扩展schema数据的选项 */
type ExpandSchemaOption = {
    /**控制最大历史记录token长度 */
    max_hist_length?:number;
    /**控制最大历史消息条数 */
    max_hist_count?:number;
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