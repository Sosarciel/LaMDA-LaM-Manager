import { LaMChainCompose } from "./LaMChainCompose";
import { LaMChainFunc } from "./LaMChainFunc";
import { LaMChainInteractor } from "./LaMChainInteractor";
import { LaMChainVerify } from "./LaMChainVerify";

export const LaMChain = {
    ...LaMChainFunc,
    ...LaMChainCompose,
    ...LaMChainVerify,
    ...LaMChainInteractor,
};

export type LaMChain = typeof LaMChain;