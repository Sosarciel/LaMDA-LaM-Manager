import { SLogger, UtilCom, UtilFunc } from '@zwa73/utils';
import createHttpsProxyAgent, {HttpsProxyAgent} from 'https-proxy-agent';
import createHttpProxyAgent, { HttpProxyAgent } from 'http-proxy-agent';
import { verifyResp } from './UtilFunction';
import { DEF_POST_LAM_OPT, IRequestFormater, PartialPostLaMOption } from '@/RequestFormatAdapter/RequestFormatInterface';
import { AnyGoogleApiRespFormat, AnyTextCompletionRespFormat } from 'TextCompletion';
import { APIPriceResp, CredsAdapter } from '@sosraciel-lamda/creds-adapter';

/**适用与 openai 鉴权方式的post工具 */
class _GeminiPostTool implements IRequestFormater {
    constructor(){
        //代理
        this.httpsAgent = createHttpsProxyAgent('http://127.0.0.1:7890');
        this.httpAgent  = createHttpProxyAgent('http://127.0.0.1:7890');
    }
    httpsAgent:HttpsProxyAgent;
    httpAgent:HttpProxyAgent;

    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    async postLaM(partialOpt:PartialPostLaMOption){
        const opt = Object.assign({},DEF_POST_LAM_OPT,partialOpt);
        const {accountData,modelData,timeLimit} = opt;
        const postOpt = accountData.instance.postOption;
        let postJson = opt.postJson;

        postJson = accountData.instance.procOption
            ? await accountData.instance.procOption(postJson) as any
            : postJson;

        const postPath = `${modelData.endpoint}/${modelData.id}:generateContent?key=${accountData.instance.getKey()}`;

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

        if(postOpt.useAgent) options.agent = postOpt.protocol=='http'
            ? this.httpAgent : this.httpsAgent;

        //post
        const tool = postOpt.protocol == 'http'
            ? UtilCom.http()
            : UtilCom.https();
        const respData = await tool.postJson()
            .once({...options,timeout:timeLimit},postJson);

        const respObj = respData?.data as AnyGoogleApiRespFormat|undefined;

        //post错误
        const respcode = respData?.statusCode ?? 0;
        const respStat = (respcode>=200 && respcode<300) ? true : false;
        if(respStat===false){
            SLogger.warn(`OpenAILaMClient.postLaM 错误 不成功的状态码 respObj: ${UtilFunc.stringifyJToken(respData,{compress:true,space:2})}`);
            return undefined;
        }
        if(respObj==undefined){
            SLogger.warn(`OpenAILaMClient.postLaM 错误 未能接收resp respObj: ${UtilFunc.stringifyJToken(respData,{compress:true,space:2})}`);
            return undefined;
        }

        //错误检测
        if ("error" in respObj) return respObj;

        //记录使用量
        const usageObj = respObj.usageMetadata;
        if(usageObj!=null){
            const usageResp:APIPriceResp = {
                completion_tokens:usageObj.candidatesTokenCount??0,
                prompt_tokens    :usageObj.promptTokenCount??0,
            };
            //增加token数据
            await CredsAdapter.calcPrice(accountData,modelData.price,usageResp);
            //打印理论的当前使用量
            await CredsAdapter.currUsedUSD(accountData);
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
        const {accountData,repTimeLimit,repCount,repTimeDelay} = opt;

        const client = this;
        //重复post的处理函数
        const procFn = async ()=>client.postLaM(opt);
        //重复post的验证函数
        const verifyFn = async (obj:AnyTextCompletionRespFormat | undefined)=>{
            //处理反馈 可以视为同步
            return await verifyResp(obj, accountData);
        };
        return await UtilFunc.retryPromise(procFn,verifyFn,{
            count       :repCount,
            tryInterval :repTimeLimit,
            tryDelay    :repTimeDelay,
        });
    }
}

export const GeminiPostTool = new _GeminiPostTool();