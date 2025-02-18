import { assertType } from '@zwa73/utils';
import { TextCompleteionModelData } from '@/TextCompletion/TextCompletionDrive';

const DeepseekChatModelDataBase = {
    /**此模型api的标准路径 */
    endpoint:'/v1beta',
    chat_formater:'google_chat',
    tokensizer:'cl100k_base',
    request_formater:'gemini',
} as const;

export const Gemini2Flash = {
    ...DeepseekChatModelDataBase,
    id:'gemini-2.0-flash',
    alias:'Gemini2Flash',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini2Flash = typeof Gemini2Flash;
assertType<TextCompleteionModelData>(Gemini2Flash);

export const Gemini15Pro = {
    ...DeepseekChatModelDataBase,
    id:'gemini-1.5-pro',
    alias:'Gemini15Pro',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini15Pro = typeof Gemini15Pro;
assertType<TextCompleteionModelData>(Gemini15Pro);

export type GoogleChatModelData = Gemini2Flash|Gemini15Pro;
export type GoogleChatModel = GoogleChatModelData['id'];