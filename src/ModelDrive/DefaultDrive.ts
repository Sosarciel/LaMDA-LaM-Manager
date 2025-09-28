import { SLogger } from "@zwa73/utils";
import { ChatTaskInterface, DefChatLaMResult, TaskInterface } from "Task";



export class DefaultDrive implements TaskInterface{
    chat:ChatTaskInterface = {
        async chat(){
            SLogger.warn(`DefaultDrive.chat.chat 未实现`);
            return DefChatLaMResult;
        },
        async calcToken(){
            SLogger.warn(`DefaultDrive.chat.calcToken 未实现`);
            return 0
        }
    };
}