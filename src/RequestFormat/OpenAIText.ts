import { OpenAITextModel } from "ModelConfig";


/**turbo模型配置 */
export type OpenAITextOption = Partial<{
    model: OpenAITextModel;
    prompt: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[] | null;
    presence_penalty: number;
    frequency_penalty: number;
    logit_bias: Record<string, number> | null;
    n: number;
}>;
