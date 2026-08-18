import type { PresetOption } from "@zwa73/js-utils";
import { SLogger } from "@zwa73/utils";

import type { ChatTaskInterface, LaMChatMessages } from "Task";
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
                option:fopt,
                tokensizerType:drive.getData().config.tokensizer,
                logLevel:fopt.log_level,
            });
            return result ?? DefChatLaMResult;
        }
    } satisfies ChatTaskInterface;
};
