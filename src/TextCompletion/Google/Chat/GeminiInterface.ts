import { assertType } from '@zwa73/utils';
import { TextCompleteionModelConfig } from '@/TextCompletion/TextCompletionDrive';

const DeepseekChatModelDataBase = {
    /**此模型api的标准路径 */
    endpoint:'/v1beta/models',
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
assertType<TextCompleteionModelConfig>(Gemini2Flash);

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
assertType<TextCompleteionModelConfig>(Gemini15Pro);

export const Gemini20Pro = {
    ...DeepseekChatModelDataBase,
    id:'gemini-2.0-pro-exp-02-05',
    alias:'Gemini20Pro',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini20Pro = typeof Gemini20Pro;
assertType<TextCompleteionModelConfig>(Gemini20Pro);

export const Gemini25Pro = {
    ...DeepseekChatModelDataBase,
    id:'gemini-2.5-pro-exp-03-25',
    //id:'gemini-2.5-pro-preview-05-06',
    alias:'Gemini25Pro',
    price:{
        promptPrice:0.00125,
        completionPrice:0.01,
    },
    valid_account:['Google'],
} as const;

export type Gemini25Pro = typeof Gemini25Pro;
assertType<TextCompleteionModelConfig>(Gemini25Pro);

export const Gemini25ProCompat = {
    ...DeepseekChatModelDataBase,
    id:'gemini-2.5-pro-exp-03-25',
    //id:'gemini-2.5-pro-preview-05-06',
    alias:'Gemini25ProCompat',
    price:{
        promptPrice:0.00125,
        completionPrice:0.01,
    },
    valid_account:['Gptge'],
    endpoint:'/v1/chat/completions',
    chat_formater:'google_chat_compat',
    request_formater:'openai',
} as const;

export type Gemini25ProCompat = typeof Gemini25ProCompat;
assertType<TextCompleteionModelConfig>(Gemini25ProCompat);

export type GoogleChatModelData = Gemini2Flash|Gemini15Pro|Gemini20Pro|Gemini25Pro|Gemini25ProCompat;
export type GoogleChatModel = GoogleChatModelData['id'];