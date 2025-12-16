"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiPostTool = void 0;
const utils_1 = require("@zwa73/utils");
const InteractorUtil_1 = require("../InteractorUtil");
const Interface_1 = require("../Interface");
const ProxyPool_1 = require("../ProxyPool");
const Util_1 = require("./Util");
/**适用与 openai 鉴权方式的post工具 */
class _GeminiPostTool {
    constructor() { }
    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaM(partialOpt) {
        const opt = Interface_1.PostLaMOptionPreset.assign(partialOpt);
        const { accountData, modelData, timeLimit } = opt;
        const postOpt = accountData.instance.categoryData;
        const postJson = opt.postJson;
        const fixModelId = accountData.instance.categoryData.model_id_map?.[modelData.id] ?? modelData.id;
        const postPath = `${modelData.endpoint}/${fixModelId}:generateContent?key=${accountData.instance.getKey()}`;
        const protocol = postOpt.protocol ?? 'https';
        const respData = await utils_1.UtilHttp.url(`${protocol}://${postOpt.hostname}`)
            .postJson().option({
            method: 'POST',
            hostname: postOpt.hostname,
            port: postOpt.port,
            path: postPath, //'/v1/chat/completions'
            headers: {
                'Content-Type': 'application/json',
            },
            agent: postOpt.proxy_url ? (0, ProxyPool_1.getProxy)(protocol, postOpt.proxy_url) : undefined,
            timeout: timeLimit,
        }).once({ json: postJson });
        const respObj = respData?.data;
        //const err = (res:string)=>outcome(Terminated,res);
        //return await pipe(respObj,
        //    v=>v==undefined
        //        ? err('GeminiPostTool.postLaM 错误 未能接收resp')
        //        : success(v), //post错误
        //    chain(({result})=>'error' in result
        //        ? failed(result) : success(result)), //错误检测 交由verfyResp函数
        //    chain(({result})=>checkRespCode(respData)===false
        //        ? err('GeminiPostTool.postLaM 错误 不成功的状态码')
        //        : success(result)), //状态码检查
        //    tap(chain(async ({result})=>recordPrice(result,modelData.price,accountData)),true), //记录用量
        //    when(Terminated,val=>void SLogger.warn(val)),
        //    chain(v=>v.result), alt(v=>v.result),
        //);
        //post错误
        if (respObj == undefined) {
            utils_1.SLogger.warn(`GeminiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }
        //错误检测
        if ("error" in respObj)
            return respObj;
        if ((0, InteractorUtil_1.checkRespCode)(respData) === false) {
            utils_1.SLogger.warn(`GeminiPostTool.postLaM 错误 不成功的状态码`);
            return undefined;
        }
        //记录使用量
        await (0, Util_1.recordPrice)(respObj, modelData.price, accountData);
        return respObj;
    }
    /**向 openai模型 重复请求发送POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaMRepeat(partialOpt) {
        //解构参数
        const opt = Interface_1.PostLaMOptionPreset.assign(partialOpt);
        const retryOption = Object.assign({}, Interface_1.PostLaMOptionPreset.default().retryOption, partialOpt.retryOption);
        return await utils_1.UtilFunc.retryPromise(async () => this.postLaM(opt), async (obj) => await (0, Util_1.verifyResp)(obj, opt.accountData), { ...retryOption, logFlag: "GeminiPostTool.postLaMRepeat" });
    }
}
exports.GeminiPostTool = new _GeminiPostTool();
