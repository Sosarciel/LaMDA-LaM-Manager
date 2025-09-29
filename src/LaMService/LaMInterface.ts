import { ServiceInterface } from "@zwa73/service-manager";
import { TaskType, TaskTypeList } from "Task";
import { AnyTextCompletionOption } from "RequestFormat";
import { LaMDrive } from "../ModelDrive/Interface";
import { UnionToIntersection } from "@zwa73/js-utils";


/**语言模型接口
 * 实现接口以供 LaMManager 统一调用
 */
export type LaMInterface = ServiceInterface<ExpandDrive<LaMDrive>>;

export type AnyLaMOption = AnyTextCompletionOption;

/**添加前缀 */
type PrefixObject<Prefix extends string, T extends {}> = {
    [K in keyof T as K extends string ? `${Prefix}-${K}`:never]:T[K]
}
/**展开驱动器为扁平接口 */
type ExpandDrive<T extends LaMDrive> = T&UnionToIntersection<{
    [K in TaskType]:K extends string ? PrefixObject<K,T[K]> : never;
}[TaskType]>;
/**展开驱动器为扁平接口 */
export const expandDrive = <T extends LaMDrive>(d:T):ExpandDrive<T> => {
    const fixedD = d as any;
    return new Proxy(d,{
        get(target,field,receiver){
            if(typeof field === 'string' && field.includes('_')){
                const [taskname,funcname] = field.split('_');
                if( TaskTypeList.includes(taskname as TaskType) &&
                    typeof fixedD[taskname][funcname] == 'function')
                    return (...args:any)=> fixedD[taskname][funcname](...args);
            }
            return fixedD[field];
        }
    }) as any;
}