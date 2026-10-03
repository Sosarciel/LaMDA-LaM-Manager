import type { PresetOption } from "@zwa73/js-utils";
import { SLogger } from "@zwa73/utils";

import type { ChatTaskInterface, ChatTaskOption, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset, DefChatLaMResult } from "Task";

import type { HttpAPIModelDrive } from "./Drive";

export const chatTaskCtor = (drive:HttpAPIModelDrive) => {
    return {
        async computeTokenCount(message: LaMChatMessages) {
            return drive.chatFormatter.computeTokenCount(message,drive.getData().config.tokensizer);
        },
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            const account = await drive.selectAccount(fopt);
            if(account===undefined){
                SLogger.warn(`HttpAPIModelDrive.chat 错误 无有效账号`);
                return DefChatLaMResult;
            }
            const result = await drive.chatFormatter.execute({
                cred:account.cred,
                source:account.source,
                model:drive.getData().config,
                option:middleware(fopt),
                tokensizerType:drive.getData().config.tokensizer,
            });
            return result ?? DefChatLaMResult;
        }
    } satisfies ChatTaskInterface;
};


//通用标签中间件
const middleware = (option:ChatTaskOption)=>{
    if(option.hint?.includes('<remove_age>')){
        option.hint = option.hint.replace('<remove_age>','');
        //插入提示
        option.messages = option.messages.map(v=>{
            if(v.type!='desc') return v;

            v.content = v.content
                .replace(/^Age[:：-\s]\d+.*(\r?\n|$)/gim,'')
                .replace(/\d+[-\s]years?[-\s]old/gi,'young');

            return v;
        });
    }

    return option;
};