import type { PresetOption } from "@zwa73/utils";
import type { LaMChatMessages } from "../../Task";
import { ChatTaskOptionPreset } from "../../Task";
import type { TestModule } from "./Drive";
export declare const chatTaskCtor: (drive: TestModule) => {
    execute(opt: PresetOption<typeof ChatTaskOptionPreset>): Promise<{
        completed: import("../../Task").TextCompletionResp;
        pending: never[];
    }>;
    countToken(messageList: LaMChatMessages): Promise<number>;
};
