import type { AnyFunc, PRecord} from "@zwa73/utils";
import { None, PresetOption, SLogger, UtilFunc } from "@zwa73/utils";
import type { ServiceConfig, ServiceManagerBaseConfig} from "@zwa73/service-manager";
import { ServiceManager, ServiceManagerOption } from "@zwa73/service-manager";
import type { TextCompletionOption, TaskType, TaskInterface } from "Task";
import { ChatTaskOptionPreset, LaMChatMessages,DefChatLaMResult, TextCompletionResult } from "Task";
import type { HttpAPIModelData} from "ModelDrive";
import { HttpAPIModelDrive, TestModule } from "ModelDrive";
import { expandDrive } from "./LaMInterface";
import { DefaultDrive } from "../ModelDrive/DefaultDrive";



const CtorTable = {
    HttpAPIModel : async (d:HttpAPIModelData)=> expandDrive(new HttpAPIModelDrive(d)),
    Test         : async ()=> expandDrive(new TestModule()),
};
/**用于实例加载 */
export type LaMServiceJsonTable = ServiceManagerBaseConfig & {
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
        get(target1,prop1,receiver1){
            if(typeof prop1 != 'string' || prop1 in target1)
                return Reflect.get(target1,prop1,receiver1);

            //基于taskName创建代理
            return TaskProxyCache[prop1] ??= new Proxy({},{
                get(target2, prop2, receiver2) {
                    if(typeof prop2 != 'string') return undefined;
                    return async (instanceName:string,...args:any)=>{
                        if(! await mgr.sm.hasService(instanceName)){
                            SLogger.warn(`LaMManager.${prop1}.${prop2} 错误 instanceName:${instanceName} 不存在, 将使用默认驱动器`);
                            return (defDrive as any)[prop1][prop2](instanceName,...args);
                        }
                        return await mgr.sm.invoke(instanceName,`${prop1}-${prop2}` as any,...args);
                    };
                },
            });
        }
    }) as _LaMManager&{
        [TSK in TaskType]:{
            [K in keyof TaskInterface[TSK]]: TaskInterface[TSK][K] extends AnyFunc
                ? (instanceName:string,...args:Parameters<TaskInterface[TSK][K]>)=>ReturnType<TaskInterface[TSK][K]>
                : never
        }
    };
};

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
