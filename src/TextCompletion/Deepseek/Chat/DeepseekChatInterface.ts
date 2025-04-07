import { assertType } from '@zwa73/utils';
import { TextCompleteionModelData } from '@/TextCompletion/TextCompletionDrive';

const DeepseekChatModelDataBase = {
    /**此模型api的标准路径 */
    tokensizer:'deepseek',
    request_formater:'openai',
} as const;

export const DeepseekChat = {
    ...DeepseekChatModelDataBase,
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
assertType<TextCompleteionModelData>(DeepseekChat);


export const DeepseekChatBeta = {
    ...DeepseekChatModelDataBase,
    chat_formater:'deepseek_chat_beta',
    endpoint:'/beta/v1/chat/completions',
    id:'deepseek-chat',
    alias:'DeepseekChat',
    price:{
        cacheHitPromptPrice:0.0005,
        promptPrice:0.002,
        completionPrice:0.008,
    },
    valid_account:['Deepseek'],
} as const;
export type DeepseekChatBeta = typeof DeepseekChatBeta;
assertType<TextCompleteionModelData>(DeepseekChatBeta);

export type DeepseekChatModelData = DeepseekChat;
export type DeepseekChatModel = DeepseekChatModelData['id'];