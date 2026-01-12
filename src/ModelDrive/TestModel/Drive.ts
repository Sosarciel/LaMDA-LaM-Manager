import type { TextCompletionOption } from "Task";
import { getTokensizer } from "Tokensizer";

import { DefaultDrive } from "ModelDrive/DefaultDrive";
import type { LaMDrive } from "ModelDrive/Interface";


import { chatTaskCtor } from "./ChatTask";


/**测试模型 */
export class TestModel extends DefaultDrive implements LaMDrive{
    chat = chatTaskCtor(this);

    async isRuning(){return true;}
    async getData(){return {};}
    getDefaultOption(): TextCompletionOption {
        return {};
    }

    async encodeToken(str: string) {
        return getTokensizer("cl100k_base").encode(str);
    }
    async decodeToken(arr: number[]) {
        return getTokensizer("cl100k_base").decode(arr);
    }
}