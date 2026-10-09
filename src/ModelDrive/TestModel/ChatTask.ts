import type { OpenAITextResponse } from "@sosraciel-lamda/lam-chain";
import type { JObject, PresetOption } from "@zwa73/utils";
import { SLogger, UtilFunc } from "@zwa73/utils";

import type { ChatTaskInterface, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset, OpenAITextChatTaskFormatter } from "Task";

import type { TestModel } from "./Drive";

/**不参与param回显的字段
 * messages 是庞大的历史记录, 且不属于 TextCompletionOption
 */
const EXCLUDE_PARAM_KEYS = ["messages", "target", "log_level"] as const;

/**序列化单个参数值
 * 字符串加双引号, 其余走 JSON
 * @param value - 待序列化的值
 * @returns 序列化文本
 */
const serializeValue = (value: unknown): string => {
    if (typeof value === "string") return `"${value}"`;
    return JSON.stringify(value);
};

/**把参数序列化为 `k=v` 形式
 * 与用户输入 `cmd:params temp=1 hint="123"` 的写法保持一致
 * @param opt - 参数对象
 * @returns 序列化文本 无有效字段时为空串
 */
const serializeParams = (opt: JObject): string => {
    const parts: string[] = [];
    for (const key of Object.keys(opt).sort()) {
        if ((EXCLUDE_PARAM_KEYS as readonly string[]).includes(key)) continue;
        const value = opt[key];
        if (value === undefined) continue;
        parts.push(`${key}=${serializeValue(value)}`);
    }
    return parts.join(" ");
};

/**提取最后一条消息的文本内容
 * @param messageList - 通用消息列表
 * @returns 末条消息内容 空列表时为""
 */
const lastMessageContent = (messageList: LaMChatMessages): string => {
    const last = messageList[messageList.length - 1];
    return last?.content ?? "";
};

/**回显段的分隔符 */
const SEG_SPLIT = " | ";
/**回显前缀 */
const ECHO_PREFIX = "echo ";
const PARAM_PREFIX = "param ";
const TIME_PREFIX = "time ";
/**构造回显文本
 *
 * 供自动化测试以正则断言:
 * `echo [我们的输入] | param [所有吃到的参数]`
 *
 * 不含消息下标: 下标属于 dialog 层的 choice 概念, 模型层无从持有
 *
 * temperature 为 0 时内容完全确定, 相同请求会得到相同回复,
 * 因而会被上层的自动去重合并; 大于 0 时追加时间戳使各次回复互异,
 * 从而能真正生成多条候选。由此可用同一个开关覆盖两种测试场景
 * @param opt - 已补全默认值的聊天选项
 * @returns 回显文本
 */
const buildEcho = (opt: JObject): string => {
    const messages = (opt.messages ?? []) as LaMChatMessages;
    const echo = lastMessageContent(messages);
    const param = serializeParams(opt);
    const head = `${ECHO_PREFIX}${echo}${SEG_SPLIT}${PARAM_PREFIX}${param}`;
    //temperature 为 0 视为确定性请求, 不追加时间戳
    if (opt.temperature === 0) return head;
    return `${head}${SEG_SPLIT}${TIME_PREFIX}${UtilFunc.getTime()}`;
};

/**构造mock响应
 * @param content - 回复文本
 * @returns OpenAI文本响应
 */
const getMockresp = (content: string) => {
    return {
        "choices": [{
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null,
            "text": content
        }],
        "created": 1700000000,
        "id": "cmpl-ArlGEsDLJx7IJeeCynsgqAnVju4zt",
        "model": "gpt-3.5-turbo-instruct" as any,
        "object": "text_completion",
        "usage": {"completion_tokens":4248,"prompt_tokens":1849,"total_tokens":6097}
    } satisfies OpenAITextResponse;
};

export const chatTaskCtor = (drive:TestModel) => {
    return {
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            SLogger.http(fopt);
            const echo = buildEcho(fopt);
            return {
                completed:OpenAITextChatTaskFormatter.formatResp(getMockresp(echo)),
                pending:[]
            };
        },
        async computeTokenCount(messageList: LaMChatMessages): Promise<number> {
            let ntext:string="";
            for(const item of messageList){
                ntext=item.type=='desc'
                ? `${ntext}\n${item.content}`
                : `${ntext}\n${item.senderName}:${item.content}`;
            }
            const turboMessage = ntext.trim();
            return (await drive.encodeToken(turboMessage)).length;
        }
    } satisfies ChatTaskInterface;
};
