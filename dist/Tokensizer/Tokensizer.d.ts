import { Tokenizer } from "@anush008/tokenizers";
import type { NeedInit } from "@zwa73/utils";
import type { TokensizerInterface } from "./Interface";
declare class Cl100kBase implements TokensizerInterface {
    encode(str: string): Promise<number[]>;
    decode(str: number[]): Promise<string>;
    counting(str: string): Promise<number>;
}
declare class P50kBase implements TokensizerInterface {
    encode(str: string): Promise<number[]>;
    decode(str: number[]): Promise<string>;
    counting(str: string): Promise<number>;
}
declare class Deepseek implements TokensizerInterface, NeedInit {
    inited: Promise<{
        tokenizer: Tokenizer;
    }>;
    constructor();
    encode(str: string): Promise<number[]>;
    decode(str: number[]): Promise<string>;
    counting(str: string): Promise<number>;
}
export declare const TokensizerMap: {
    cl100k_base: Cl100kBase;
    p50k_base: P50kBase;
    deepseek: Deepseek;
};
export type TokensizerType = keyof typeof TokensizerMap;
export declare function getTokensizer(name: TokensizerType): TokensizerInterface;
export {};
