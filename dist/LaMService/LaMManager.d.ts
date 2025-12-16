import type { ServiceConfig, ServiceManagerBaseConfig } from "@zwa73/service-manager";
import { ServiceManager } from "@zwa73/service-manager";
import type { HttpAPIModelData } from "../ModelDrive";
import { HttpAPIModelDrive, TestModule } from "../ModelDrive";
import type { TextCompletionOption } from "../Task";
declare const CtorTable: {
    HttpAPIModel: (d: HttpAPIModelData) => Promise<HttpAPIModelDrive & {
        "chat-countToken": (message: import("../Task").LaMChatMessages) => Promise<number>;
        "chat-execute": (opt: import("@zwa73/utils").PresetOption<typeof import("../Task").ChatTaskOptionPreset>) => Promise<import("../Task").TextCompletionResult>;
    }>;
    Test: () => Promise<TestModule & {
        "chat-execute": (opt: import("@zwa73/utils").PresetOption<typeof import("../Task").ChatTaskOptionPreset>) => Promise<{
            completed: import("../Task").TextCompletionResp;
            pending: never[];
        }>;
        "chat-countToken": (messageList: import("../Task").LaMChatMessages) => Promise<number>;
    }>;
};
/**用于实例加载 */
export type LaMServiceJsonTable = ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<typeof CtorTable>;
    };
};
declare class _LaMManager {
    readonly sm: ServiceManager<{
        HttpAPIModel: (d: HttpAPIModelData) => Promise<HttpAPIModelDrive & {
            "chat-countToken": (message: import("../Task").LaMChatMessages) => Promise<number>;
            "chat-execute": (opt: import("@zwa73/utils").PresetOption<typeof import("../Task").ChatTaskOptionPreset>) => Promise<import("../Task").TextCompletionResult>;
        }>;
        Test: () => Promise<TestModule & {
            "chat-execute": (opt: import("@zwa73/utils").PresetOption<typeof import("../Task").ChatTaskOptionPreset>) => Promise<{
                completed: import("../Task").TextCompletionResp;
                pending: never[];
            }>;
            "chat-countToken": (messageList: import("../Task").LaMChatMessages) => Promise<number>;
        }>;
    }>;
    constructor(opt: LaMManagerOption);
    /**获取指定实例的默认选项 */
    getDefaultOption(instanceName: string): Promise<TextCompletionOption | undefined>;
    /**token编码
     * @async
     * @param instanceName - 目标实例名
     * @param str - 待编码的字符串
     * @returns token数组 null为计算错误
     */
    encodeToken(instanceName: string, str: string): Promise<number[] | undefined>;
    /**token解码
     * @async
     * @param instanceName - 目标实例名
     * @param arr - 待解码的token数组
     * @returns 解码的字符串 null为计算错误
     */
    decodeToken(instanceName: string, arr: number[]): Promise<string | undefined>;
}
type LaMManagerOption = {
    /**配置文件路径 */
    tablePath: string;
};
/**语言模型管理器 需先调用init */
export declare const LaMManager: _LaMManager & {
    chat: {
        countToken: (instanceName: string, messageList: import("../Task").LaMChatMessages) => Promise<number>;
        execute: (instanceName: string, opt: import("../Task").ChatTaskOption) => Promise<import("../Task").TextCompletionResult>;
    };
} & {
    initInject: (opt: LaMManagerOption) => void;
    waitInitInject: () => Promise<void>;
};
export type LaMManager = typeof LaMManager;
export {};
