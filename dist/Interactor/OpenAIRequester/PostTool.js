"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiPostTool = void 0;
const utils_1 = require("@zwa73/utils");
const InteractorUtil_1 = require("../InteractorUtil");
const Interface_1 = require("../Interface");
const ProxyPool_1 = require("../ProxyPool");
const Util_1 = require("./Util");
/**适用与 openai 鉴权方式的post工具 */
class _OpenAiPostTool {
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
        const protocol = postOpt.protocol ?? 'https';
        const respData = await utils_1.UtilHttp.url(`${protocol}://${postOpt.hostname}`)
            .postJson().option({
            hostname: postOpt.hostname,
            port: postOpt.port,
            path: modelData.endpoint, //'/v1/chat/completions'
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accountData.instance.getKey()}`,
            },
            agent: postOpt.proxy_url ? (0, ProxyPool_1.getProxy)(protocol, postOpt.proxy_url) : undefined,
            timeout: timeLimit,
        }).once({ json: postJson });
        const respObj = respData?.data;
        //post错误
        if (respObj == undefined) {
            utils_1.SLogger.warn(`OpenApiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }
        //错误检测
        if ("error" in respObj)
            return respObj;
        if ((0, InteractorUtil_1.checkRespCode)(respData) === false) {
            utils_1.SLogger.warn(`OpenApiPostTool.postLaM 错误 不成功的状态码`);
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
        return await utils_1.UtilFunc.retryPromise(async () => this.postLaM(opt), async (obj) => await (0, Util_1.verifyResp)(obj, opt.accountData), { ...retryOption, logFlag: "OpenApiPostTool.postLaMRepeat" });
    }
}
exports.OpenAiPostTool = new _OpenAiPostTool();
