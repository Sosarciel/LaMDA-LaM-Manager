import type { PresetOption } from '@zwa73/utils';
import { SLogger, UtilFunc, UtilHttp } from '@zwa73/utils';

import type { AnyOpenAIResponse } from 'ResponseFormat';


import { checkRespCode } from 'Interactor/InteractorUtil';
import type { Interactor } from 'Interactor/Interface';
import { PostLaMOptionPreset } from 'Interactor/Interface';
import { getProxy } from 'Interactor/ProxyPool';

import { recordPrice, verifyResp } from './Util';



/**适用与 openai 鉴权方式的post工具 */
class _OpenAiPostTool implements Interactor<AnyOpenAIResponse> {
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

        const respObj = respData?.data as AnyOpenAIResponse|undefined;
        //post错误
        if(respObj==undefined){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 未能接收resp`);
            return undefined;
        }

        //错误检测
        if ("error" in respObj)
            return respObj;

        if(checkRespCode(respData)===false){
            SLogger.warn(`OpenApiPostTool.postLaM 错误 不成功的状态码`);
            return undefined;
        }

        //记录使用量
        await recordPrice(respObj,modelData.price,accountData);

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
        const retryOption = UtilFunc.assignOption({},
            PostLaMOptionPreset.default().retryOption,
            partialOpt.retryOption);

        return await UtilFunc.retryPromise(
            async ()=>this.postLaM(opt),
            async obj=>await verifyResp(obj, opt.accountData),
            {...retryOption,logFlag:"OpenApiPostTool.postLaMRepeat"}
        );
    }
}

export const OpenAiPostTool = new _OpenAiPostTool();

