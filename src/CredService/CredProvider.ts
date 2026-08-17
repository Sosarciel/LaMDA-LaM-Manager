import type { MPromise } from "@zwa73/utils";
import { SLogger } from "@zwa73/utils";

import type { AccountCategoryData, AccountManager, APIPrice, APIPriceResp } from "./Interface";


/**凭据提供者 */
export type CredProvider = {
    /**名称 */
    name:string;
    /**归属类别 */
    category:string;
    /**获取类别 */
    getCategoryData:()=>AccountCategoryData;
    /**获取key */
    getKey:()=>string;
    /**计费
     * @param price - API的调用价格
     * @param usage - 用量
     */
    computePrice?:(price:APIPrice,usage:APIPriceResp)=>MPromise<void>;
    /**打印已使用的USD数量 */
    currUsage?:()=>MPromise<void>;
    /**设置为不可用 */
    setInavailable?:()=>MPromise<void>;
}

/**包装AccountManager实例为提供者, 避免外界与复杂服务对象交互 */
export const wrapperAccountManager = (opt:{
    instance:AccountManager;
    type:string;
    name:string;
}) => {
    const {instance,type,name} = opt;
    return {
        name,category:instance.getData().cred_category,
        getCategoryData: ()=>instance.categoryData,
        getKey: ()=>instance.getKey(),
        async computePrice(price:APIPrice,usage:APIPriceResp){
            const promptCount = usage.prompt_cache_miss_tokens ?? usage.prompt_tokens;
            const cachedPromptCount = usage.prompt_cache_hit_tokens ?? 0;
            const completionCount = usage.completion_tokens;
            const totalPrice =
                (promptCount*price.promptPrice)+
                (completionCount*price.completionPrice)+
                (cachedPromptCount*(price.cacheHitPromptPrice??0));
            if(isNaN(totalPrice)){
                SLogger.error(`CredManager.computePrice 错误 无法计算价格`);
                SLogger.error(usage);
                return;
            }
            await instance.addPrice(totalPrice);
        },
        async currUsage(){
            const credit = (instance.getData().used_credit??0)/1000;
            SLogger.info(`${type}: ${name} 当前理论使用量: ${credit} USD`);
        },
        async setInavailable(){
            await instance.setInavailable();
        }
    } satisfies CredProvider;
};