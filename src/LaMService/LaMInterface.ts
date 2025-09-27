import { ServiceInterface } from "@zwa73/service-manager";
import { ChatTaskInterface, TextCompletionInterface } from "Task";
import { AnyTextCompletionOption } from "RequestFormat";


/**语言模型接口
 * 实现接口以供 LaMManager 统一调用
 */
export type LaMInterface = ServiceInterface<TextCompletionInterface&ChatTaskInterface>;

export type AnyLaMOption = AnyTextCompletionOption;