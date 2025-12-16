import type { Interactor } from "../../Interactor";
import type { ChatTaskFormatter, TextCompletionOption, TextCompletionTaskFormatter } from "../../Task";
import { DefaultDrive } from "../DefaultDrive";
import type { HttpAPIModelData } from "../HttpApiModel/Interface";
import type { LaMDrive } from "../Interface";
/**适用于网络API的文本完成模型驱动器 */
export declare class HttpAPIModelDrive extends DefaultDrive implements LaMDrive {
    private data;
    chatFormater: ChatTaskFormatter<any, any, any>;
    interactor: Interactor;
    chat: {
        countToken(message: import("../../Task").LaMChatMessages): Promise<number>;
        execute(opt: import("@zwa73/utils").PresetOption<typeof import("../../Task").ChatTaskOptionPreset>): Promise<import("../../Task").TextCompletionResult>;
    };
    constructor(data: HttpAPIModelData);
    isRuning(): boolean;
    getData(): HttpAPIModelData;
    getDefaultOption(): TextCompletionOption;
    decodeToken(arr: number[]): Promise<string>;
    encodeToken(str: string): Promise<number[]>;
    /**task共用请求 */
    commonTask(opt: TextCompletionOption, formatter: TextCompletionTaskFormatter<any, any, any>): Promise<import("../../Task").TextCompletionResult>;
}
