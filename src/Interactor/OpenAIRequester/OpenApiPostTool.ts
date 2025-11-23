import { PresetOption, SLogger, UtilFunc, UtilHttp} from '@zwa73/utils';
import { verifyResp } from './UtilFunction';
import { Interactor, PostLaMOptionPreset } from '@/src/Interactor/Interface';
import { APIPriceResp, CredManager } from 'CredService';
import type { AnyOpenAIConversationLikeRespFormat, AnyOpenAIRespFormat } from 'ResponseFormat';
import { getProxy } from '../ProxyPool';


/**适用与 openai 鉴权方式的post工具 */
class _OpenApiPostTool implements Interactor<AnyOpenAIRespFormat> {
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

        const protocol = postOpt.protocol??'https';

        const respData = await UtilHttp.url(`${protocol}://${postOpt.hostname}`)
            .postJson().option({
                hostname: postOpt.hostname,
                port: postOpt.port,
                path: modelData.endpoint,//'/v1/chat/completions'
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accountData.instance.getKey()}`,
                },
                agent: postOpt.proxy_url ? getProxy(protocol,postOpt.proxy_url) : undefined,
                timeout:timeLimit,
            }).once({json:postJson});

        const respObj = respData?.data as AnyOpenAIConversationLikeRespFormat|undefined;
        //post错误
        if(respObj==undefined){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }

        //错误检测
        if ("error" in respObj)
            return respObj;

        const respcode = respData?.statusCode ?? 0;
        const respStat = respcode>=200 && respcode<300;
        if(respStat===false){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 不成功的状态码`);
            return undefined;
        }

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

