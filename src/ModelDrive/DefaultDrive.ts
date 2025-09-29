import { SLogger } from "@zwa73/utils";
import { ChatTaskInterface, DefChatLaMResult, TaskInterface } from "Task";



export class DefaultDrive implements TaskInterface{
    chat:ChatTaskInterface = {
        async execute(){
            SLogger.warn(`DefaultDrive.chat.execute 未实现`);
            return DefChatLaMResult;
        },
        async countToken(){
            SLogger.warn(`DefaultDrive.chat.countToken 未实现`);
            return 0
        }
    };
}