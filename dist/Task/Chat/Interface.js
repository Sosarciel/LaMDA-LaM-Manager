"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTypeList = exports.ChatTaskOptionPreset = void 0;
const utils_1 = require("@zwa73/utils");
/**默认的聊天设置 */
exports.ChatTaskOptionPreset = (0, utils_1.preset)()({
    max_tokens: 16,
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    n: 1,
    logit_bias: null,
    think_budget: null,
    preferred_account: [],
    log_level: "none",
});
/**消息可用类型 */
exports.MessageTypeList = ["chat", "desc"];
