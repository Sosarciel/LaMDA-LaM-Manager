import { None, SLogger, throwError } from "@zwa73/utils";
import { ServiceManager } from "@zwa73/service-manager";
import { LaMInterface } from "./LaMInterface";
import { DefChatLaMResult, TextCompletionOptions, TextCompletionResult} from 'TextCompletion';
import { DEF_CHAT_OPT, LaMChatMessages, PartialChatOption } from "ChatTask";
import { HttpAPIModelDrive, HttpAPIModelData, TestModule } from "ModelDrive";



const CtorTable = {
    //GPT35Chat           : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT35Chat),
    //GPT35Text           : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT35Text),
    //GPT4                : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT4),
    //GPT4O               : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT4O),
    //GPT4OMini           : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT4OMini),
    //GPT4Chat            : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,GPT4Chat),
    //DeepseekChat        : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,DeepseekChat),
    //DeepseekChatBeta    : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,DeepseekChatBeta),
    //Gemini2Flash        : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,Gemini2Flash),
    //Gemini15Pro         : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,Gemini15Pro),
    //Gemini20Pro         : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,Gemini20Pro),
    //Gemini25Pro         : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,Gemini25Pro),
    //Gemini25ProCompat   : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d,Gemini25ProCompat),
    HttpAPIModel          : async (d:HttpAPIModelData)=> new HttpAPIModelDrive(d),
    Test                  : async (d:{})=> new TestModule(),
};
export type LaMCtorTable = typeof CtorTable;

class _LaMManager{
    readonly sm;
    constructor(tablePath:string){
        this.sm = ServiceManager.from<LaMCtorTable,LaMInterface>({
            cfgPath:tablePath,
            ctorTable:CtorTable
        });
    }
    /**模型路由
     * @async
     * @param instanceName - 目标实例名
     * @param opt          - 参数
     * @returns 结果
     */
    async chat(instanceName:string,opt:PartialChatOption):Promise<TextCompletionResult>{
        const fopt = Object.assign({},DEF_CHAT_OPT,opt);
        const resp = await this.sm.invoke(instanceName,'chat',fopt);
        if(resp===None){
            SLogger.warn(`LaMManager.chat 错误 instanceName:${instanceName} 不存在`);
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
        const res = await this.sm.invoke(instanceName,'calcToken',messageList);
        if(res==None){
            SLogger.warn(`LaMManager.calcToken 错误 instanceName:${instanceName} 不存在`);
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
        const res = await this.sm.invoke(instanceName,'encodeToken',str);
        if(res===None){
            SLogger.warn(`LaMManager.encodeToken 错误 instanceName:${instanceName} 不存在`);
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
        const res = await this.sm.invoke(instanceName,'decodeToken',arr);
        if(res===None){
            SLogger.warn(`LaMManager.calcToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
    /**获取指定实例的默认选项 */
    async getDefaultOption(instanceName:string):Promise<TextCompletionOptions|undefined>{
        const res = await this.sm.invoke(instanceName,'getDefaultOption');
        if(res===None){
            SLogger.warn(`LaMManager.getDefaultOption 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
}

/**语言模型管理器 需先调用init */
export type LaMManager = _LaMManager&{init:(tablePath: string)=>void};
export const LaMManager = new Proxy({} as {ins?:_LaMManager}, {
    get(target, prop, receiver) {
        if (prop === 'init') {
            return (tablePath: string) => {
                if (target.ins==null)
                    target.ins = new _LaMManager(tablePath);
            };
        }
        if (target.ins==null) throwError("LaMManager 未初始化", 'error');
        return Reflect.get(target.ins, prop, receiver);
    }
}) as any as LaMManager;
