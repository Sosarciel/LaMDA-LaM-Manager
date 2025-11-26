import type { PresetOption } from "@zwa73/js-utils";
import type { HttpAPIModelDrive } from "./Drive";
import type { ChatTaskInterface, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset } from "Task";





export const chatTaskCtor = (drive:HttpAPIModelDrive) => {
    return {
        async countToken(message: LaMChatMessages) {
            return drive.chatFormater.calcToken(message,drive.getData().config.tokensizer);
        },
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            return drive.commonTask(fopt,drive.chatFormater);
        }
    } satisfies ChatTaskInterface;
};