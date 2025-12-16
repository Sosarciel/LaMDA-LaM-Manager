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
export declare const TemplateOpenAITextResponse: {
    choices: {
        finish_reason: "stop";
        index: number;
        logprobs: null;
        text: string;
    }[];
    created: number;
    id: "cmpl-Armlpt8gE4zBYcKy8gel7TpRSdVud";
    model: string;
    object: "text_completion";
    usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
    };
};
export {};
