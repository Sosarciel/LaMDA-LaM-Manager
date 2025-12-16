"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const retry2PromiseRetries = (retry) => {
    return {
        count: retry?.count,
        tryInterval: retry?.try_interval,
        tryDelay: retry?.try_delay,
        expBackoff: retry?.exp_backoff,
        expBackoffMax: retry?.exp_backoff_max,
        logFlag: retry?.logFlag,
        logLevel: retry?.logLevel
    };
};
