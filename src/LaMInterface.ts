import { ServiceInterface } from "@zwa73/service-manager";
import { AnyTextCompletionModel, AnyTextCompletionOption, TextCompletionResult, ChatTaskOption, LaMChatMessages } from "./TextCompletion";


/**语言模型接口
 * 实现接口以供 LaMManager 统一调用
 */
export type LaMInterface = ServiceInterface<{
    /**计算token数量
     * @async
     * @param messageList - 待计算的通用消息列表
     * @returns token数
     */
    calcToken(messageList:LaMChatMessages):Promise<number>;
    /**token编码
     * @async
     * @param str - 待编码的字符串
     * @returns Token数组
     */
    encodeToken(str:string):Promise<number[]>
    /**token解码
      * @param arr = Token数组
      * @returns 消息字符串
      */
    decodeToken(arr:number[]):Promise<string>
    /**和语言模型实例对话
     * @param opt - 对话选项
     * @returns 对话结果
     */
    chat(opt:ChatTaskOption):Promise<TextCompletionResult>
}>;

export type AnyLaModel   = AnyTextCompletionModel;
export type AnyLaMOption = AnyTextCompletionOption;