import type { PromiseRetryResult } from "@zwa73/js-utils";

import type { OpenAITextResponse, TextChoice } from "ResponseFormat";

import type { TextCompletionResult, TextCompletionResp } from "Task/DataInterface";
import type { InstructTaskOption } from "Task/Instruct/Interface";

/**构建FIM模式的提示文本 */
export function buildFIMPrompt(opt: InstructTaskOption): string {
    if (opt.prefix) {
        return `${opt.prompt}${opt.prefix}`;
    }
    return opt.prompt;
}

/**验证任务选项 */
export function validateInstructOption(opt: InstructTaskOption): boolean {
    return typeof opt.prompt === "string" && opt.prompt.length > 0;
}

/**通用格式化响应 */
export function commonFormatResp(resp: OpenAITextResponse): TextCompletionResp {
    return {
        choices: resp.choices.map((choice: TextChoice) => ({
            content: choice.text,
        })),
        vaild: true,
    };
}

/**通用格式化结果 */
export async function commonFormatResult(
    resp: PromiseRetryResult<OpenAITextResponse | undefined> | undefined,
    formatResp: (resp: OpenAITextResponse) => TextCompletionResp
): Promise<TextCompletionResult> {
    if (!resp) {
        return { completed: undefined, pending: [] };
    }
    if (resp.completed) {
        return {
            completed: formatResp(resp.completed),
            pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
                const result = await p;
                return result ? formatResp(result) : undefined;
            }),
        };
    }
    return {
        completed: resp.completed ? formatResp(resp.completed) : undefined,
        pending: resp.pending.map(async (p: Promise<OpenAITextResponse | undefined>) => {
            const result = await p;
            return result ? formatResp(result) : undefined;
        }),
    };
}
