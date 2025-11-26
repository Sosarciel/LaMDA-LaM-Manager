import type { ServiceInterface } from "@zwa73/service-manager";
import type { TaskType} from "Task";
import { TaskTypeList } from "Task";
import type { AnyTextCompletionOption } from "RequestFormat";
import type { LaMDrive } from "../ModelDrive/Interface";
import type { UnionToIntersection } from "@zwa73/js-utils";


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
    return new Proxy(d as any,{
        get(target,prop,receiver){
            if(typeof prop != 'string' || prop in target)
                return Reflect.get(target,prop,receiver);

            const match = prop.match(/(.+)-(.+)/);
            if(match==null) return undefined;

            const [_,task,func] = match;
            const taskObj = target[task];
            if(TaskTypeList.includes(task as TaskType) && typeof taskObj[func] == 'function')
                return (...args:any)=> taskObj[func](...args);
        }
    });
};
