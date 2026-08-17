import { SLogger, UtilFunc } from "@zwa73/utils";

import type { CredProvider, SourceProvider } from "@/src/LaMChain/Interface";

import { CredManager } from "./CredManager";
import type { AccountManager } from "./Interface";



/**包装AccountManager实例为提供者, 避免外界与复杂服务对象交互 */
export const wrapperAccountManager = async (opt:{
    instance:AccountManager;
    type:string;
    name:string;
}) => {
    const {instance,type,name} = opt;
    const cateData = await CredManager.getCategoryData(instance.getData().cred_category);
    return {
        source:{
            name:cateData.id,
            hostname:cateData.hostname,
            protocol:cateData.protocol,
            port:cateData.port,
            proxyUrl:cateData.proxy_url,
            model_id_map:cateData.model_id_map,
            retry:UtilFunc.snakeToCamel(cateData.retry),
        } satisfies SourceProvider,
        cred:{
            name,category:instance.getData().cred_category,
            get key(){
                return instance.getKey();
            },
            recordCost:async (totalPrice)=> await instance.recordCost(totalPrice),
            currUsage(){
                const credit = (instance.getData().used_credit??0)/1000;
                SLogger.info(`${type}: ${name} 当前理论使用量: ${credit} USD`);
            },
            async setInavailable(){
                await instance.setInavailable();
            }
        } satisfies CredProvider,
    };
};