import type { TextCompletionOption } from "../../Task";
import { DefaultDrive } from "../DefaultDrive";
import type { LaMDrive } from "../Interface";
/**测试模型 */
export declare class TestModule extends DefaultDrive implements LaMDrive {
    chat: {
        execute(opt: import("@zwa73/js-utils").PresetOption<typeof import("../../Task").ChatTaskOptionPreset>): Promise<{
            completed: import("../../Task").TextCompletionResp;
            pending: never[];
        }>;
        countToken(messageList: import("../../Task").LaMChatMessages): Promise<number>;
    };
    isRuning(): Promise<boolean>;
    getData(): Promise<{}>;
    getDefaultOption(): TextCompletionOption;
    encodeToken(str: string): Promise<number[]>;
    decodeToken(arr: number[]): Promise<string>;
}
