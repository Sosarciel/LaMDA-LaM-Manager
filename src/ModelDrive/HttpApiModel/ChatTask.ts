import type { PresetOption } from "@zwa73/js-utils";

import type { ChatTaskInterface, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset } from "Task";

import type { HttpAPIModelDrive } from "./Drive";

export const chatTaskCtor = (drive:HttpAPIModelDrive) => {
    return {
        async computeTokenCount(message: LaMChatMessages) {
            return drive.chatFormater.computeTokenCount(message,drive.getData().config.tokensizer);
        },
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            return drive.commonTask(fopt,drive.chatFormater);
        }
    } satisfies ChatTaskInterface;
};