import { SLogger } from "@zwa73/utils";

import type { ChatTaskInterface, TaskInterface } from "Task";
import { DefChatLaMResult } from "Task";



export class DefaultDrive implements TaskInterface{
    chat:ChatTaskInterface = {
        async execute(){
            SLogger.warn(`DefaultDrive.chat.execute 被调用, 可能是某个Drive未实现task接口, 或是实例不存在`);
            return DefChatLaMResult;
        },
        async computeTokenCount(){
            SLogger.warn(`DefaultDrive.chat.computeToken 被调用, 可能是某个Drive未实现task接口, 或是实例不存在`);
            return 0;
        }
    };
}