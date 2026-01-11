
import { CredManager } from "CredService";
import { LaMManager } from "LaMService";

import { LaMManagerMockTool } from "Mock/Utils";



const beforeAll = async ()=>{
    LaMManager.initInject({
        serviceTable :LaMManagerMockTool.MOCK_LAM_SERVICE_TABLE,
    });
    CredManager.initInject({
        serviceTable :LaMManagerMockTool.MOCK_CRED_SERVICE_TABLE,
        categoryTable:LaMManagerMockTool.MOCK_CRED_CATEGORY_TABLE,
    });
};

const main = async ()=>{
    await beforeAll();
    const result = await LaMManager.chat.execute('GPT35Text',{
        target:LaMManagerMockTool.MOCK_CHAR,
        messages:{list:[{
            content:"你好",
            type:'chat',
            senderName:LaMManagerMockTool.MOCK_USER,
        }]},
        log_level:"debug",
        n:1,
        max_tokens:100,
        stop:["\n"],
    });
    console.log(result);
};

void main();