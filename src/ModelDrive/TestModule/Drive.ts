import { getTokensizer } from "Tokensizer";
import { TextCompletionOption } from "Task";
import { chatTaskCtor } from "./ChatTask";
import { DefaultDrive } from "../DefaultDrive";
import { LaMDrive } from "../Interface";


/**测试模型 */
export class TestModule extends DefaultDrive implements LaMDrive{
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