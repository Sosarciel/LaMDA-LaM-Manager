import type { LogLevel } from "@zwa73/js-utils";
import type { ServiceInterface } from "@zwa73/service-manager";

/**账户管理器接口 */
export type AccountManager = ServiceInterface<{
    getData:()=>AccountData;
    /**计费
     * @param price - 价格
     */
    recordCost(price:number):Promise<void>;
    /**检测账户是否可用
     * @param accountName - 账户名
     */
    checkAccount():Promise<boolean>
    /**设置某个账户为不可用 */
    setInavailable():Promise<void>
    /**获取key */
    getKey():string;
}>;

export type CredCategoryID = string;

/**小蛇型标准的重试设定 */
type SnackRetry = Partial<{
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
    log_flag?: string;
    /**是否打印重试步骤 默认true */
    log_level?: LogLevel;
    /**打印警告级尝试流程的log等级 默认warn */
    warn_level?: LogLevel;
}>;

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
    retry?:SnackRetry;
    /**modelid 映射  
     * 用于处理类似SiliconFlow的模型id不一致问题
     */
    model_id_map?:Record<string,string>;
    /**支持的模型
     * name 为别名 * 为所有模型
     * weight 为优先度, 优先使用高优先度的有效账号 单字符串时为1
     */
    valid_model?:(string|{name:string,weight:number})[];
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