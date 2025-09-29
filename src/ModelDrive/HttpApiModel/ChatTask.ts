import { PresetOption } from "@zwa73/js-utils";
import { HttpAPIModelDrive } from "./Drive";
import { ChatTaskOption, ChatTaskOptionPreset, LaMChatMessages } from "Task";





export const chatTaskCtor = (drive:HttpAPIModelDrive) => {
    return {
        async calcToken(message: LaMChatMessages) {
            return drive.chatFormater.calcToken(message,drive.getData().config.tokensizer);
        },
        async chat(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            return drive.commonTask(fopt,drive.chatFormater);
        }
    }
}