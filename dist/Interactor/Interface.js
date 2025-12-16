"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostLaMOptionPreset = void 0;
const utils_1 = require("@zwa73/utils");
/**默认的聊天设置 */
exports.PostLaMOptionPreset = (0, utils_1.preset)()({
    timeLimit: 3_600_000,
    retryOption: {
        count: 3,
        tryInterval: 300_000,
        tryDelay: 3,
    }
});
//#endregion
