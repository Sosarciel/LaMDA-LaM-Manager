import { SLogger, UtilFunc, UtilHttp } from '@zwa73/utils';
import {HttpsProxyAgent} from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { verifyResp } from './UtilFunction';
import { DEF_POST_LAM_OPT, IRequestFormater, PartialPostLaMOption } from '@/src/Interactor';
import { APIPriceResp, CredManager } from 'CredService';
import { GeminiRespFormat, AnyTextCompletionRespFormat } from 'ResponseFormat';
import { getProxy } from '../ProxyPool';

/**适用与 openai 鉴权方式的post工具 */
class _GeminiPostTool implements IRequestFormater {
    constructor(){}

    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaM(partialOpt:PartialPostLaMOption){
        const opt = Object.assign({},DEF_POST_LAM_OPT,partialOpt);
        const {accountData,modelData,timeLimit} = opt;
        const postOpt = accountData.instance.categoryData;
        const postJson = opt.postJson;

        const fixModelId = accountData.instance.categoryData.model_id_map?.[modelData.id] ?? modelData.id;
        const postPath = `${modelData.endpoint}/${fixModelId}:generateContent?key=${accountData.instance.getKey()}`;

        //组装opt
        const options = {
            method: 'POST'  as const,
            hostname: postOpt.hostname,
            port: postOpt.port,
            path: postPath,//'/v1/chat/completions'
            headers: {
                'Content-Type': 'application/json',
            },
            agent: undefined as HttpsProxyAgent|HttpProxyAgent|undefined,
        };

        const protocol = postOpt.protocol??'https';
        if(postOpt.proxy_url)
            options.agent = getProxy(protocol,postOpt.proxy_url);

        //post
        const tool = protocol == 'http'
            ? UtilHttp.http()
            : UtilHttp.https();
        const respData = (await tool.postJson()
            .option({...options,timeout:timeLimit})
            .once({json:postJson}));

        const respObj = respData?.data as GeminiRespFormat|undefined;

        //post错误
        const respcode = respData?.statusCode ?? 0;
        const respStat = (respcode>=200 && respcode<300) ? true : false;
        if(respObj==undefined){
            SLogger.warn(`GeminiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }
        if(respStat===false){
            SLogger.warn(`GeminiPostTool.postLaM 错误 不成功的状态码`);
            return undefined;
        }

        //错误检测
        if ("error" in respObj) return respObj;

        //记录使用量
        const usageObj = respObj.usageMetadata;
        if(usageObj!=null){
            const usageResp:APIPriceResp = {
                completion_tokens:usageObj.candidatesTokenCount??0+usageObj.thoughtsTokenCount??0,
                prompt_tokens    :usageObj.promptTokenCount??0,
            };
            //增加token数据
            await CredManager.calcPrice(accountData,modelData.price,usageResp);
            //打印理论的当前使用量
            await CredManager.currUsedUSD(accountData);
        }else SLogger.error(`OpenAILaMClient.postLaM 警告 无法计费 未找到 usage, respObj:\n${respObj}`);

        return respObj;
    }
    /**向 openai模型 重复请求发送POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaMRepeat(partialOpt:PartialPostLaMOption){
        //解构参数
        const opt = Object.assign({},DEF_POST_LAM_OPT,partialOpt);
        const retryOption = Object.assign({},DEF_POST_LAM_OPT.retryOption,partialOpt.retryOption);
        const {accountData} = opt;

        const client = this;
        //重复post的处理函数
        const procFn = async ()=>client.postLaM(opt);
        //重复post的验证函数
        const verifyFn = async (obj:AnyTextCompletionRespFormat | undefined)=>{
            //处理反馈 可以视为同步
            return await verifyResp(obj, accountData);
        };
        return await UtilFunc.retryPromise(procFn,verifyFn,{...retryOption,flag:"GeminiPostTool.postLaMRepeat"});
    }
}

export const GeminiPostTool = new _GeminiPostTool();