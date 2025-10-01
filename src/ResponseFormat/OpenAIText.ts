/**文本API回复格式 */
export type OpenAITextRespFormat = {
    id: `cmpl-${string}`;
    object: "text_completion";
    created: number;
    model: string;
    choices: TextChoiceFormat[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};
/**文本API选项格式 */
type TextChoiceFormat = {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: "stop" | "length";
};


export const TemplateOpenAITextResponse = {
    choices: [
        {
            finish_reason: "stop",
            index: 0,
            logprobs: null,
            text: "您好，有什么需要帮助的吗？",
        },
        {
            finish_reason: "stop",
            index: 1,
            logprobs: null,
            text: "您好，有什么需要帮助的吗？",
        },
    ],
    created: 1737382221,
    id: "cmpl-Armlpt8gE4zBYcKy8gel7TpRSdVud",
    model: "gpt-3.5-turbo-instruct",
    object: "text_completion",
    usage: { completion_tokens: 3289, prompt_tokens: 1849, total_tokens: 5138 },
} satisfies OpenAITextRespFormat;
