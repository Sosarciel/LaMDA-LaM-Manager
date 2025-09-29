import { AnyFunc, None, PRecord, PresetOption, SLogger, UtilFunc } from "@zwa73/utils";
import { ServiceConfig, ServiceManager, ServiceManagerBaseConfig, ServiceManagerOption } from "@zwa73/service-manager";
import { ChatTaskOptionPreset, LaMChatMessages,DefChatLaMResult, TextCompletionOption, TextCompletionResult, TaskType } from "Task";
import { HttpAPIModelDrive, HttpAPIModelData, TestModule } from "ModelDrive";
import { expandDrive } from "./LaMInterface";
import { LaMDrive } from "../ModelDrive/Interface";
import { DefaultDrive } from "../ModelDrive/DefaultDrive";



const CtorTable = {
    HttpAPIModel          : async (d:HttpAPIModelData)=> expandDrive(new HttpAPIModelDrive(d)),
    Test                  : async (d:{})=> expandDrive(new TestModule()),
};
/**用于实例加载 */
type LaMServiceJsonTable = ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<typeof CtorTable>;
    };
};

class _LaMManager{
    readonly sm;
    constructor(opt:LaMManagerOption){
        const {tablePath} = opt;
        this.sm = ServiceManager.from({
            cfgPath:tablePath,
            ctorTable:CtorTable
        });
    }
    /**获取指定实例的默认选项 */
    async getDefaultOption(instanceName:string):Promise<TextCompletionOption|undefined>{
        const res = await this.sm.invoke(instanceName,'getDefaultOption');
        if(res===None){
            SLogger.warn(`LaMManager.getDefaultOption 错误 instanceName:${instanceName} 不存在`);
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
}

//构造代理
const defDrive = new DefaultDrive();
const TaskProxyCache:PRecord<string,any> = {};
const proxyCtor = (mgr:_LaMManager)=>{
    return new Proxy(mgr,{
        get(target1,p1,receiver1){
            if(p1 in target1) return Reflect.get(target1,p1,receiver1);
            if(typeof p1 != 'string') return Reflect.get(target1,p1,receiver1);

            if(TaskProxyCache[p1]!=undefined)
                return TaskProxyCache[p1];
            TaskProxyCache[p1] = new Proxy({},{
                get(target2, p2, receiver2) {
                    return async (instanceName:string,...args:any)=>{
                        if(typeof p2 != 'string') return Reflect.get(target2,p2,receiver2);
                        if(! await mgr.sm.hasService(instanceName)){
                            SLogger.warn(`LaMManager.${p1}.${p2} 错误 instanceName:${instanceName} 不存在, 将使用默认驱动器`);
                            return (defDrive as any)[p1][p2](instanceName,...args);
                        }
                        return await mgr.sm.invoke(instanceName,`${p1}_${p2}` as any,...args);
                    }
                },
            });
            return TaskProxyCache[p1];
        }
    }) as _LaMManager&{
        [TSK in keyof LaMDrive]:{
            [K in keyof LaMDrive[TSK]]: LaMDrive[TSK][K] extends AnyFunc
                ? (instanceName:string,...args:Parameters<LaMDrive[TSK][K]>)=>ReturnType<LaMDrive[TSK][K]>
                : never
        }
    };
}

type LaMManagerOption = {
    /**配置文件路径 */
    tablePath:string;
}
/**语言模型管理器 需先调用init */
export const LaMManager = UtilFunc.createInjectable({
    initInject:(opt:LaMManagerOption)=>{
        return proxyCtor(new _LaMManager(opt));
    }
});
export type LaMManager = typeof LaMManager;
