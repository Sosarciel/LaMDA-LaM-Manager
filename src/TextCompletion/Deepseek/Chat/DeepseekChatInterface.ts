import { assertType } from '@zwa73/utils';
import { TextCompleteionModelData } from '../../TextCompletionDrive';

const DeepseekChatModelDataBase = {
    /**此模型api的标准路径 */
    endpoint:'/v1/chat/completions',
    chat_formater:'deepseek_chat',
    tokensizer:'deepseek',
    request_formater:'openai',
} as const;

export const DeepseekChat = {
    ...DeepseekChatModelDataBase,
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

export type DeepseekChatModelData = DeepseekChat;
export type DeepseekChatModel = DeepseekChatModelData['id'];