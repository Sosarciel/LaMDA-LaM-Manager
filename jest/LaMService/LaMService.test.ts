import { CredManager, LaMChatMessages, LaMManager, MessageType } from "@";
import { ROOT_PATH } from "../MockManager";
import path from "pathe";

beforeAll(()=>{
    LaMManager.initInject({
        tablePath:path.join(ROOT_PATH,'LaMService.json'),
    });

    CredManager.initInject({
        tablePath        :path.join(ROOT_PATH,'CredService.json'),
        categoryTablePath:path.join(ROOT_PATH,'CredCategory.json'),
    });
})

describe("LaMService", () => {
    describe("ChatTask", () => {
        it("尝试与GPT35Turbo对话", async () => {
            const result = await LaMManager.chat.execute("GPT35Turbo",{
                target:"someone_char",
                messages:new LaMChatMessages({
                    content:"你好",
                    type:MessageType.CHAT,
                    name:"someone_user",
                    id:"uid",
                }),
                log_level:"debug",
                n:1,
                max_tokens:100,
                stop:["\n"],
            });
            console.log(result);
        });
    });
});
