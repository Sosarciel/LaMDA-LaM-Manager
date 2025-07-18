import { assertType } from '@zwa73/utils';
import { DeepReadonly } from 'ModelConfig';
import { HttpApiModelCategory } from 'ModelDrive';

const GeminiModelDataBase = {
    /**此模型api的标准路径 */
    endpoint:'/v1beta/models',
    chat_formater:'google_chat',
    tokensizer:'cl100k_base',
    interactor:'gemini',
} as const;

export const Gemini2Flash = {
    ...GeminiModelDataBase,
    id:'gemini-2.0-flash',
    alias:'Gemini2Flash',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini2Flash = typeof Gemini2Flash;
assertType<DeepReadonly<HttpApiModelCategory>>(Gemini2Flash);

export const Gemini15Pro = {
    ...GeminiModelDataBase,
    id:'gemini-1.5-pro',
    alias:'Gemini15Pro',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini15Pro = typeof Gemini15Pro;
assertType<DeepReadonly<HttpApiModelCategory>>(Gemini15Pro);

export const Gemini20Pro = {
    ...GeminiModelDataBase,
    id:'gemini-2.0-pro-exp-02-05',
    alias:'Gemini20Pro',
    price:{
        promptPrice:0,
        completionPrice:0,
    },
    valid_account:['Google'],
} as const;

export type Gemini20Pro = typeof Gemini20Pro;
assertType<DeepReadonly<HttpApiModelCategory>>(Gemini20Pro);

export const Gemini25Pro = {
    ...GeminiModelDataBase,
    id:'gemini-2.5-pro-preview-06-05',
    //id:'gemini-2.5-pro-preview-05-06',
    alias:'Gemini25Pro',
    price:{
        promptPrice:0.00125,
        completionPrice:0.01,
    },
    valid_account:['Google'],
} as const;

export type Gemini25Pro = typeof Gemini25Pro;
assertType<DeepReadonly<HttpApiModelCategory>>(Gemini25Pro);

export const Gemini25ProCompat = {
    ...GeminiModelDataBase,
    id:'gemini-2.5-pro-preview-06-05',
    //id:'gemini-2.5-pro-preview-05-06',
    //id:'gemini-2.5-pro-exp-03-25',
    alias:'Gemini25ProCompat',
    price:{
        promptPrice:0.00125,
        completionPrice:0.01,
    },
    valid_account:['Gptge'],
    endpoint:'/v1/chat/completions',
    chat_formater:'google_chat_compat',
    Interactor:'openai',
} as const;

export type Gemini25ProCompat = typeof Gemini25ProCompat;
assertType<DeepReadonly<HttpApiModelCategory>>(Gemini25ProCompat);

export type GeminiModelData = Gemini2Flash|Gemini15Pro|Gemini20Pro|Gemini25Pro|Gemini25ProCompat;
export type GeminiModel = GeminiModelData['id'];