import type { UnionToIntersection } from "@zwa73/js-utils";
import type { ServiceInterface } from "@zwa73/service-manager";
import type { AnyTextCompletionOption } from "../RequestFormat";
import type { TaskType } from "../Task";
import type { LaMDrive } from "../ModelDrive/Interface";
/**语言模型接口
 * 实现接口以供 LaMManager 统一调用
 */
export type LaMInterface = ServiceInterface<ExpandDrive<LaMDrive>>;
export type AnyLaMOption = AnyTextCompletionOption;
/**添加前缀 */
type PrefixObject<Prefix extends string, T extends {}> = {
    [K in keyof T as K extends string ? `${Prefix}-${K}` : never]: T[K];
};
/**展开驱动器为扁平接口 */
type ExpandDrive<T extends LaMDrive> = T & UnionToIntersection<{
    [K in TaskType]: K extends string ? PrefixObject<K, T[K]> : never;
}[TaskType]>;
/**展开驱动器为扁平接口 */
export declare const expandDrive: <T extends LaMDrive>(d: T) => ExpandDrive<T>;
export {};
