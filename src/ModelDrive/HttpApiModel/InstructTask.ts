import { SLogger } from "@zwa73/utils";

import { DefChatLaMResult, type TextCompletionResult } from "Task/DataInterface";
import type { InstructTaskInterface, InstructTaskOption } from "Task/Instruct";

import type { HttpAPIModelDrive } from "./Drive";

/** 指导式文本生成任务构造函数 */
export function instructTaskCtor(drive: HttpAPIModelDrive): InstructTaskInterface {
    return {
        /**计算提示文本的Token数量 */
        async computeTokenCount(prompt: string): Promise<number> {
            const tokens = await drive.encodeToken(prompt);
            return tokens.length;
        },

        /**执行指导式文本生成 */
        async execute(opt: InstructTaskOption): Promise<TextCompletionResult> {
            if(drive.instructFormatter==undefined){
                SLogger.warn(`${drive.getData().config.alias} 不支持指导式文本生成`);
                return DefChatLaMResult;
            }
            return drive.commonTask(opt, drive.instructFormatter);
        },
    };
}
