import type { MPromise, PromiseRetryResult } from "@zwa73/js-utils";
import { UtilFP } from "@zwa73/utils";

import type { CredProvider } from "CredService";
import type { HttpApiModelInfo } from "ModelDrive";
import type { GeminiRequest } from "RequestFormat";

import { GeminiPostTool } from "Interactor/GeminiRequester";


const postGeminiRequest = (cred:CredProvider)=>async (params:{
    model:HttpApiModelInfo;
    json:GeminiRequest;
})=>{
    const {model,json} = params;
    return GeminiPostTool.postLaMRepeat({
        postJson:json,
        accountData:cred,
        modelData:model,
    });
};

const reduceRepeatResult =  async <T>(t:MPromise<PromiseRetryResult<T>>) => (await t)?.completed;

async ()=>{

    const v = UtilFP.flow(
        postGeminiRequest(null as any),
        async res => reduceRepeatResult(res),
    );
};
