import type { PresetOption } from "@zwa73/js-utils";
import type { LaMChatMessages } from "../../Task";
import { ChatTaskOptionPreset } from "../../Task";
import type { HttpAPIModelDrive } from "./Drive";
export declare const chatTaskCtor: (drive: HttpAPIModelDrive) => {
    countToken(message: LaMChatMessages): Promise<number>;
    execute(opt: PresetOption<typeof ChatTaskOptionPreset>): Promise<import("../../Task").TextCompletionResult>;
};
