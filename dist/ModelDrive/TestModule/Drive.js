"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestModule = void 0;
const Tokensizer_1 = require("../../Tokensizer");
const DefaultDrive_1 = require("../DefaultDrive");
const ChatTask_1 = require("./ChatTask");
/**测试模型 */
class TestModule extends DefaultDrive_1.DefaultDrive {
    chat = (0, ChatTask_1.chatTaskCtor)(this);
    async isRuning() { return true; }
    async getData() { return {}; }
    getDefaultOption() {
        return {};
    }
    async encodeToken(str) {
        return (0, Tokensizer_1.getTokensizer)("cl100k_base").encode(str);
    }
    async decodeToken(arr) {
        return (0, Tokensizer_1.getTokensizer)("cl100k_base").decode(arr);
    }
}
exports.TestModule = TestModule;
