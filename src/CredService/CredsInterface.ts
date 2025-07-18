import { ServiceInterface } from "@zwa73/service-manager";
import { JObject, MPromise, PRecord, PromiseRetries } from "@zwa73/utils";
import { CredsData } from "./CredsManager";

/**账户管理器接口 */
export type AccountManager = ServiceInterface<{
    getData:()=>AccountData;
    /**计费
     * @param price        - 价格
     */
    addPrice(price:number):Promise<void>;
    /**检测账户是否可用
     * @param accountName - 账户名
     */
    checkAccount():Promise<boolean>
    /**设置某个账户为不可用 */
    setInavailable():Promise<void>
    /**此类型账户请求时的参数 */
    postOption:AccountPostOption;
    /**获取key */
    getKey():string;
}>;

/**此类型账户请求时的参数 */
export type AccountPostOption = {
    /**此类型账户的hostname */
    hostname:string;
    /**此类型账户的port */
    port:number;
    /**是否使用代理 */
    useAgent:boolean;
    /**所用协议 默认https */
    protocol?:'http' | 'https';
    /**重试设定 */
    retryOption?:PromiseRetries;
    /**账号对postjson的特殊处理 */
    procOption?:(obj:JObject)=>any;
}

/**价格 */
export type APIPrice={
    /**提示每 1 token 价格 单位: 1/1000 usd */
    promptPrice:number;
    /**完成每 1 token 价格 单位: 1/1000 usd */
    completionPrice:number;
    /**缓存命中提示每 1 token 价格 单位: 1/1000 usd */
    cacheHitPromptPrice?:number;
}
/**计费反馈 */
export type APIPriceResp = {
    /**补全的token数量 */
    completion_tokens:number;
    /**提示的token数量 */
    prompt_tokens:number;
    /**缓存命中的提示token数量 */
    prompt_cache_hit_tokens?:number;
    /**缓存未命中的补全token数量 */
    prompt_cache_miss_tokens?:number;
}

/**账号数据 */
export type AccountData = {
    /**APIKey */
    api_key: string|string[];
    /**有效的 */
    is_available?: boolean;
    /**使用的额度 单位 千分之一USD */
    used_credit?: number;
    /**额度限制 单位 千分之一USD */
    credit_limit?: number;
};

/**凭证类型 */
export type CredsType = CredsData['type'];