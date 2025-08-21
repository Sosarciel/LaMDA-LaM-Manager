import { ServiceInterface } from "@zwa73/service-manager";
import { LogLevel, PromiseRetries } from "@zwa73/js-utils";

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
    categoryData:AccountCategoryData;
    /**获取key */
    getKey():string;
}>;

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

export type CredCategoryID = string;
/**账户类型数据 */
export type AccountCategoryData = {
    /**此账户类型的id */
    id:CredCategoryID;
    /**此类型账户的hostname */
    hostname:string;
    /**此类型账户的port */
    port:number;
    /**是否使用代理 */
    proxy_url?:string;
    /**所用协议 默认https */
    protocol?:'http' | 'https';
    /**重试设定 PromiseRetries */
    retry?:Partial<{
        /**重试次数 默认3*/
        count?: number;
        /**尝试间隔时间/毫秒 超过此事件会重新创建新的Promise
         * 同时等待新的与旧的Promise 默认180_000
         * 最小1000毫秒, 小于1000则视为无限
         */
        try_interval?: number;
        /**尝试延迟/毫秒 重新尝试时会先等待此毫秒数
         * 默认0
         */
        try_delay?: number;
        /**是否使用指数回退 默认false 仅在tryDelay被设置时有效 */
        exp_backoff?: boolean;
        /**指数回退上限值 默认无限*/
        exp_backoff_max?: number;
        /**此重试任务的标志 */
        logFlag?: string;
        /**是否打印重试步骤 默认true */
        logLevel?: LogLevel;
    }>;
    /**modelid 映射  
     * 用于处理类似SiliconFlow的模型id不一致问题
     */
    model_id_map?:Record<string,string>;
}

const retry2PromiseRetries = (retry:AccountCategoryData['retry']):PromiseRetries=>{
    return {
        count:retry?.count,
        tryInterval:retry?.try_interval,
        tryDelay:retry?.try_delay,
        expBackoff:retry?.exp_backoff,
        expBackoffMax:retry?.exp_backoff_max,
        logFlag:retry?.logFlag,
        logLevel:retry?.logLevel
    }
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
    /**凭证类别 由 CredCategoryJsonTable 定义 */
    cred_category: string;
};