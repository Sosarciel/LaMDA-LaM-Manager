import type { OpenAITextOption } from "../../../RequestFormat";
export declare const procGPT35Text: (data: OpenAITextOption) => {
    choices: {
        index: number;
        text: string;
        finish_reason: "stop";
        logprobs: null;
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
