import { HttpAPIModelDrive } from "./Drive";
import { ChatTaskOption, LaMChatMessages } from "Task";





export const chatTaskCtor = (drive:HttpAPIModelDrive) => {
    return {
        async calcToken(message: LaMChatMessages) {
            return drive.chatFormater.calcToken(message,drive.getData().config.tokensizer);
        },
        async chat(opt: ChatTaskOption) {
            return drive.commonTask(opt,drive.chatFormater);
        }
    }
}