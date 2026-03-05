

//#region Eylink
/** 转发api请求失败 */
type OneApiRequestFailed =  {
    error: {
        message: 'do request failed: Post "https://api.open-proxy.cn/v1/chat/completions": unexpected EOF (request id: 2025120200210529140123796977233)';
        type: "one_api_error";
        param: "";
        code: "do_request_failed";
    };
};

/**转发API过载 */
type NewApiOverloaded = {
    error: {
        message: "当前分组上游负载已饱和，请稍后再试",
        type: "new_api_error",
        param: "",
        code: "service_err"
    }
}

/**转发API限额 通常非真实限额而是系统故障 */
type NewApiQuota = {
    error: {
        message: "用户额度不足, 剩余额度: ＄-0.003902 (request id: 202512131514256181461144rZFXvw3) (request id: 2025121315142517238973603614606)";
        type: "new_api_error";
        param: "";
        code: "insufficient_user_quota";
    };
};
//#endregion


//#region Gptge
/** gptge提示词阻拦 */
type VApiPromptBlock = {
    error: {
        message: "request blocked by Gemini API: PROHIBITED_CONTENT  (request id: 2025112323102079161323703192322)";
        type: "v_api_error";
        param: "";
        code: "prompt_blocked";
    };
};
//#endregion

type UpstreamOverloaded = {
    error: {
        message: "当前分组上游负载已饱和，请稍后再试 (request id: 20260306000025282925491HVozszq5)";
        type: "upstream_error";
        param: "";
        code: "429";
    };
};

/**综合转发API错误 */
export type AnyForwardErrorResponse = OneApiRequestFailed|NewApiOverloaded|NewApiQuota|VApiPromptBlock|UpstreamOverloaded;