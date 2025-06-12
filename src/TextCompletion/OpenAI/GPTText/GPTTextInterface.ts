import { assertType } from "@zwa73/utils";
import { TextCompleteionModelConfig } from "@/TextCompletion/TextCompletionDrive";

const OpenAITextModelDataBase = {
    endpoint:'/v1/completionss',
    chat_formater:'openai_text',
    tokensizer:'cl100k_base',
    request_formater:'openai',
} as const;

export const GPT35Text = {
    ...OpenAITextModelDataBase,
    id:'gpt-3.5-turbo-instruct',
    alias:'GPT35Text',
    price:{
        promptPrice:0.0015,
        completionPrice:0.002
    },
    valid_account:['EylinkAz','Eylink4','Gptge','Gptus'],
} as const;
export type GPT35Text = typeof GPT35Text;
assertType<TextCompleteionModelConfig>(GPT35Text);

export type OpenAITextModelData = GPT35Text;
export type OpenAITextModel = OpenAITextModelData['id'];