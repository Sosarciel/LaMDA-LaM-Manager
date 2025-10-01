import { CredManager, LaMChatMessages, LaMManager, MessageType } from "@";
import { DATA_PATH } from "../Constant";
import path from "pathe";

beforeAll(()=>{
    LaMManager.initInject({
        tablePath:path.join(DATA_PATH,'LaMService.json'),
    });

    CredManager.initInject({
        tablePath        :path.join(DATA_PATH,'CredService.json'),
        categoryTablePath:path.join(DATA_PATH,'CredCategory.json'),
    });
})

describe("LaMService", () => {
    describe("ChatTask", () => {
        const chatFn = async (instanceName:string) => {
            return LaMManager.chat.execute(instanceName,{
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
        }
        it("尝试与 GPT35Chat 对话", async () => {
            const result = await chatFn("GPT35Chat");
            expect(result.completed?.choices?.[0].content).toBe("来自GPT35Chat的响应");
        });
    });
});
