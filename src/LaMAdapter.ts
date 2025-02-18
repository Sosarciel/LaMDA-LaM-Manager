import { None, SLogger } from "@zwa73/utils";
import { ServiceConfig, ServiceCtorTable2FullCfgTable, ServiceManager, ServiceManagerMainCfg } from "@zwa73/service-manager";
import path from 'pathe';
import { LaMInterface } from "./LaMInterface";
import { TestModule } from "./TextCompletion/TestModule";
import { TextCompleteionModel } from "./TextCompletion/TextCompletionDrive";
import { DeepseekChat, DEF_CHAT_OPT, DefChatLaMResult, Gemini15Pro, Gemini2Flash, GPT35Chat, GPT35Text, GPT4, GPT4Chat, GPT4O, GPT4OMini, LaMChatMessages, PartialChatOption, TextCompletionResult } from "./TextCompletion";



const CtorTable = {
    GPT35Chat     : async (d:{})=> new TextCompleteionModel(GPT35Chat),
    GPT35Text     : async (d:{})=> new TextCompleteionModel(GPT35Text),
    GPT4          : async (d:{})=> new TextCompleteionModel(GPT4),
    GPT4O         : async (d:{})=> new TextCompleteionModel(GPT4O),
    GPT4OMini     : async (d:{})=> new TextCompleteionModel(GPT4OMini),
    GPT4Chat      : async (d:{})=> new TextCompleteionModel(GPT4Chat),
    DeepseekChat  : async (d:{})=> new TextCompleteionModel(DeepseekChat),
    Gemini2Flash  : async (d:{})=> new TextCompleteionModel(Gemini2Flash),
    Gemini15Pro   : async (d:{})=> new TextCompleteionModel(Gemini15Pro),
    Test          : async (d:{})=> new TestModule(),
};
type CtorTable = typeof CtorTable;

export type LaMAdapterJsonTable = ServiceManagerMainCfg&{
    instance_table:{
        [key:string]:ServiceCtorTable2FullCfgTable<CtorTable,ServiceConfig>
    }
}

class _LaMAdapter extends ServiceManager<
    LaMInterface,
    CtorTable>{
    constructor(){
        const configPath = path.join(process.cwd(), "data", "LaMAdapter.json");
        super(configPath,CtorTable);
    }
    /**模型路由
     * @async
     * @param instanceName - 目标实例名
     * @param opt          - 参数
     * @returns 结果
     */
    async chat(instanceName:string,opt:PartialChatOption):Promise<TextCompletionResult>{
        const fopt = Object.assign({},DEF_CHAT_OPT,opt);
        const resp = await this.invoke(instanceName,'chat',fopt);
        if(resp===None){
            SLogger.warn(`LaMAdapter.chat 错误 instanceName:${instanceName} 不存在`);
            return DefChatLaMResult;
        }
        return resp;
    }
    /**计算token数量
     * @async
     * @param instanceName - 目标实例名
     * @param messageList - 待计算的通用消息表
     * @returns token数 null为计算错误
     */
    async calcToken(instanceName:string,messageList:LaMChatMessages):Promise<number|undefined>{
        const res = await this.invoke(instanceName,'calcToken',messageList);
        if(res==None){
            SLogger.warn(`LaMAdapter.calcToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
    /**token编码
     * @async
     * @param instanceName - 目标实例名
     * @param str - 待编码的字符串
     * @returns token数组 null为计算错误
     */
    async encodeToken(instanceName:string,str:string):Promise<number[]|undefined>{
        const res = await this.invoke(instanceName,'encodeToken',str);
        if(res===None){
            SLogger.warn(`LaMAdapter.encodeToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
    /**token解码
     * @async
     * @param instanceName - 目标实例名
     * @param arr - 待解码的token数组
     * @returns 解码的字符串 null为计算错误
     */
    async decodeToken(instanceName:string,arr:number[]):Promise<string|undefined>{
        const res = await this.invoke(instanceName,'decodeToken',arr);
        if(res===None){
            SLogger.warn(`LaMAdapter.calcToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
}

const LaMAdapter = new _LaMAdapter();
type LaMAdapter = _LaMAdapter;
export {LaMAdapter};
export default LaMAdapter;