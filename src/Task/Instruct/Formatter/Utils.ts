import type { InstructTaskOption } from "Task/Instruct/Interface";

/**构建FIM模式的提示文本 (prompt + prefix) */
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
