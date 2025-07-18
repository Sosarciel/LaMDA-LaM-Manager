import { assertType, JObject } from "@zwa73/utils";
import { AccountPostOption } from "./CredsInterface";


/**Deepseek官方账号参数
 * https://platform.deepseek.com
 */
export const DeepseekOption:AccountPostOption = {
    hostname : 'api.deepseek.com',
    port     : 443,
    useAgent : false,
}
assertType<AccountPostOption>(DeepseekOption);

/**DoubleGPT账号参数  
 * https://doublegpt.io  
 */
export const DoubleGPTOption:AccountPostOption = {
    hostname : 'www.doublegpt.io',
    port     : 443,
    useAgent : true,
};
assertType<AccountPostOption>(DoubleGPTOption);

/**旧版Eylink账号参数  
 * https://eylink.cn  
 */
export const EylinkOption:AccountPostOption = {
    hostname : 'gtapi.xiaoerchaoren.com',
    port     : 8932,
    useAgent : false,
}
assertType<AccountPostOption>(EylinkOption);


/**新版Eylink账号参数  
 * https://eylink.cn  
 *   
 * https://gtfast.xiaoerchaoren.com:8937
 * http://gtfast.xiaoerchaoren.com:8930
 * 15.204.101.64:4000
 */
export const Eylink4Option:AccountPostOption = {
    //hostname : '15.204.101.64',
    hostname : 'api.yesapikey.com',
    //port     : 4000,
    port     : 443,
    useAgent : false,
    //protocol : 'http' as const
    protocol : 'https' as const
}
assertType<AccountPostOption>(Eylink4Option);

/**Eylink az转发 账号参数  
 * https://eylink.cn  
 */
export const EylinkAzOption:AccountPostOption = {
    hostname : 'az.yesapikey.com',
    port     : 443,
    useAgent : false,
    protocol : 'https' as const
}
assertType<AccountPostOption>(EylinkAzOption);

/**谷歌官方账号参数  
 * https://ai.google.dev/gemini-api/docs/  
 */
export const GoogleOption:AccountPostOption = {
    hostname : 'generativelanguage.googleapis.com',
    port     : 443,
    useAgent : true,
}
assertType<AccountPostOption>(GoogleOption);


/**Gptge账号参数  
 * https://api.gpt.ge  
 */
export const GptgeOption:AccountPostOption = {
    hostname : 'api.gpt.ge',
    port     : 443,
    useAgent : false,
    procOption(option:JObject){
        /**应对以下转换方式 需合并system
         *  for _, message := range textRequest.Messages {
         *      if messageLink.Role == "system" {
         *          geminiRequest.Systeminstruction = &ChatContent{
         *              Parts: []Part{ { Text: messageLink.StringContent() } }
         *          }
         *          continue
         *      }
         *  }
         */
        type MessageArr = {
            content:string;
            role:"system"|"assistant"|"user";
        }[];
        if( 'model' in option && typeof option.model === 'string' &&
            'messages' in option && Array.isArray(option.messages) &&
            option.model.includes('gemini')){
                const message = option.messages as MessageArr;
                let topstr:string = "";
                let isContinus = true;
                const seps:MessageArr = [];
                message.forEach(obj => {
                    if(isContinus && obj.role=="system" && obj.content.length>10)
                        return topstr+=obj.content+"\n";
                    isContinus = false;
                    seps.push({
                        role:obj.role == "system" ? "user" : obj.role,
                        content:obj.content,
                    });
                });
                option.messages = [
                    {role:"system",content:topstr.trim()},
                    ...seps,
                ]
        }
        return option;
    },
    retryOption:{
        count:3,
        tryInterval:60_000
    }
}
assertType<AccountPostOption>(GptgeOption);

/**Gptus账号参数  
 * https://www.gptapi.us  
 * 很差  
 */
export const GptusOption:AccountPostOption = {
    hostname : 'www.gptapi.us',
    port     : 443,
    useAgent : false,
}
assertType<AccountPostOption>(GptusOption);

/**OpenAI账号参数  
 * https://openai.com  
 */
export const OpenAIOption:AccountPostOption = {
    hostname : 'api.openai.com',
    port     :  443,
    useAgent : true,
}
assertType<AccountPostOption>(OpenAIOption);

/**硅基流动账号参数  
 * https://cloud.siliconflow.cn  
 */
export const SiliconFlowOption:AccountPostOption = {
    hostname : 'api.siliconflow.cn',
    port     : 443,
    useAgent : false,
    procOption(option:JObject){
        const modelNameMap:Record<string,string>={
            "deepseek-chat":"deepseek-ai/DeepSeek-V3"
        };
        if('model' in option && typeof option.model === 'string'){
            const mapname = modelNameMap[option.model];
            if(mapname!=null)
                option.model = mapname as any;
        }
        return option;
    },
}
assertType<AccountPostOption>(SiliconFlowOption);