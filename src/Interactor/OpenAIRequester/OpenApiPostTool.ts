import { PresetOption, SLogger, UtilFunc, UtilHttp} from '@zwa73/utils';
import {HttpsProxyAgent} from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { verifyResp } from './UtilFunction';
import { IRequestFormater, PostLaMOptionPreset } from '@/src/Interactor/Interface';
import { APIPriceResp, CredManager } from 'CredService';
import { AnyOpenAIConversationLikeRespFormat } from 'ResponseFormat';
import { getProxy } from '../ProxyPool';


/**适用与 openai 鉴权方式的post工具 */
class _OpenApiPostTool implements IRequestFormater {
    constructor(){}

    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaM(partialOpt:PresetOption<typeof PostLaMOptionPreset>){
        const opt = PostLaMOptionPreset.assign(partialOpt);
        const {accountData,modelData,timeLimit} = opt;
        const postOpt = accountData.instance.categoryData;
        const postJson = opt.postJson;

        //组装opt
        const options = {
            method: 'POST'  as const,
            hostname: postOpt.hostname,
            port: postOpt.port,
            path: modelData.endpoint,//'/v1/chat/completions'
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accountData.instance.getKey()}`,
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
        const respData = await tool.postJson()
            .option({...options,timeout:timeLimit})
            .once({json:postJson});

        const respObj = respData?.data as AnyOpenAIConversationLikeRespFormat|undefined;

        //post错误
        const respcode = respData?.statusCode ?? 0;
        const respStat = (respcode>=200 && respcode<300) ? true : false;
        if(respObj==undefined){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }
        if(respStat===false){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 不成功的状态码`);
            return undefined;
        }

        //错误检测
        if ("error" in respObj) return respObj;

        //记录使用量
        const usageObj = respObj.usage;
        if(usageObj!=null){
            const usageResp:APIPriceResp = {
                completion_tokens       :usageObj.completion_tokens??0,
                prompt_tokens           :usageObj.prompt_tokens??0,
            };
            if('prompt_cache_hit_tokens' in usageObj)
                usageResp.prompt_cache_hit_tokens = usageObj.prompt_cache_hit_tokens;
            if('prompt_cache_miss_tokens' in usageObj)
                usageResp.prompt_cache_miss_tokens = usageObj.prompt_cache_miss_tokens;
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
    async postLaMRepeat(partialOpt:PresetOption<typeof PostLaMOptionPreset>){
        //解构参数
        const opt = PostLaMOptionPreset.assign(partialOpt);
        const retryOption = Object.assign({},
            PostLaMOptionPreset.default().retryOption,
            partialOpt.retryOption);

        return await UtilFunc.retryPromise(
            async ()=>this.postLaM(opt),
            async obj=>await verifyResp(obj, opt.accountData),
            {...retryOption,logFlag:"OpenApiPostTool.postLaMRepeat"}
        );
    }
}

export const OpenApiPostTool = new _OpenApiPostTool();

