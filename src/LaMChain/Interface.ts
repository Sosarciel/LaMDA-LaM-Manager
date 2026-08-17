import type { MPromise, PromiseRetries } from "@zwa73/js-utils";

import type { APIPrice } from "CredService";

/**凭据提供者 */
export type CredProvider = {
    /**名称 */
    name?:string;
    /**归属类别 */
    category?:string;
    /**获取key */
    key:string;

    /**计费
     * @param price - API的调用价格
     */
    recordCost?:(price:number)=>MPromise<void>;
    /**打印已使用的USD数量 */
    currUsage?:()=>MPromise<void>;
    /**设置为不可用 */
    setInavailable?:()=>MPromise<void>;
}

/**源提供者 */
export type SourceProvider = {
    /**名称 */
    name?:string;
    /**hostname */
    hostname:string;
    /**port */
    port:number;
    /**是否使用代理 */
    proxyUrl?:string;
    /**所用协议 默认https */
    protocol?:'http' | 'https';
    /**重试设定 PromiseRetries */
    retry?:PromiseRetries;
    /**modelid 映射  
     * 用于处理类似SiliconFlow的模型id不一致问题
     */
    model_id_map?:Record<string,string>;
}

/**模型信息 */
export type ModelInfo = {
    /**模型id */
    id:string;
    /**标准模型价格 */
    price?:Partial<APIPrice>;
}