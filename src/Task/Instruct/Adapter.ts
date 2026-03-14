import type { AnyTextCompletionRequest } from "RequestFormat";
import type { AnyTextCompletionResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";

import type { TextCompletionResult } from "Task/DataInterface";
import type { TextCompletionTaskFormatter, RespFormatter } from "Task/ToolInterface";

import { OpenAIText, DeepseekText, DeepseekPrefix } from "./Formatter";
import type { InstructTaskInterface, InstructTaskOption } from "./Interface";


/**指导式文本生成任务格式化器 */
export type InstructTaskFormatter<
    REQ extends AnyTextCompletionRequest,
    RES extends AnyTextCompletionResponse
> = TextCompletionTaskFormatter<InstructTaskOption, REQ, RES> &
    RespFormatter<RES> & {
        /**计算Token数量 */
        computeTokenCount(prompt: string, tokensizerType: TokensizerType): Promise<number>;
    };

/**指导式文本生成任务格式化器表 */
export const InstructTaskFormaterTable = {
    "openai_text": OpenAIText,
    "deepseek_text": DeepseekText,
    "deepseek_prefix": DeepseekPrefix,
};

/**指导式文本生成任务格式化器类型 */
export type InstructFormaterType = keyof typeof InstructTaskFormaterTable;

/**获取指导式文本生成任务格式化器 */
export function getInstructTaskFormatter(
    type: string,
): InstructTaskFormatter<any, any> | undefined {
    return InstructTaskFormaterTable[type as InstructFormaterType];
}

/**指导式文本生成任务适配器 */
export class InstructTaskAdapter implements InstructTaskInterface {
    private formatter: InstructTaskFormatter<any, any>;
    private modelId: string;
    private tokensizerType: TokensizerType;

    /**构造函数 */
    constructor(formatterType: string, modelId: string, tokensizerType: TokensizerType) {
        const formatter = getInstructTaskFormatter(formatterType);
        if (!formatter) {
            throw new Error(`InstructTaskFormatter not found: ${formatterType}`);
        }
        this.formatter = formatter;
        this.modelId = modelId;
        this.tokensizerType = tokensizerType;
    }

    /**计算提示文本的Token数量 */
    async computeTokenCount(prompt: string): Promise<number> {
        return this.formatter.computeTokenCount(prompt, this.tokensizerType);
    }

    /**执行指导式文本生成 */
    async execute(opt: InstructTaskOption): Promise<TextCompletionResult> {
        const formattedOption = await this.formatter.formatOption({
            option: opt,
            modelId: this.modelId,
            tokensizerType: this.tokensizerType,
        });

        if (!formattedOption) {
            throw new Error("Failed to format option");
        }

        // 这里需要调用实际的API请求，暂时返回一个模拟结果
        // 实际实现中应该集成到Interactor中
        const mockResponse = {
            choices: [
                {
                    text: "This is a mock response for instruct task",
                },
            ],
        };

        return this.formatter.formatResult({ completed: mockResponse, pending: [] });
    }
}
