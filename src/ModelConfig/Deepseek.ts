import { assertType } from '@zwa73/utils';
import { TextCompleteionModelConfig } from 'TextCompletion';

const DeepseekModelDataBase = {
    /**此模型api的标准路径 */
    tokensizer:'deepseek',
    request_formater:'openai',
} as const;

export const DeepseekChat = {
    ...DeepseekModelDataBase,
    chat_formater:'deepseek_chat',
    endpoint:'/v1/chat/completions',
    id:'deepseek-chat',
    alias:'DeepseekChat',
    price:{
        cacheHitPromptPrice:0.0005,
        promptPrice:0.002,
        completionPrice:0.008,
    },
    valid_account:['Deepseek','SiliconFlow'],
} as const;
export type DeepseekChat = typeof DeepseekChat;
assertType<TextCompleteionModelConfig>(DeepseekChat);


export const DeepseekChatBeta = {
    ...DeepseekModelDataBase,
    chat_formater:'deepseek_chat_beta',
    endpoint:'/beta/v1/chat/completions',
    id:'deepseek-chat',
    alias:'DeepseekChatBeta',
    price:{
        cacheHitPromptPrice:0.0005,
        promptPrice:0.002,
        completionPrice:0.008,
    },
    valid_account:['Deepseek'],
} as const;
export type DeepseekChatBeta = typeof DeepseekChatBeta;
assertType<TextCompleteionModelConfig>(DeepseekChatBeta);

export type DeepseekModelData = DeepseekChat;
export type DeepseekModel = DeepseekModelData['id'];