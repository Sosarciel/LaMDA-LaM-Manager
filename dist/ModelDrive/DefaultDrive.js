"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDrive = void 0;
const utils_1 = require("@zwa73/utils");
const Task_1 = require("../Task");
class DefaultDrive {
    chat = {
        async execute() {
            utils_1.SLogger.warn(`DefaultDrive.chat.execute 被调用, 可能是某个Drive未实现task接口, 或是实例不存在`);
            return Task_1.DefChatLaMResult;
        },
        async countToken() {
            utils_1.SLogger.warn(`DefaultDrive.chat.countToken 被调用, 可能是某个Drive未实现task接口, 或是实例不存在`);
            return 0;
        }
    };
}
exports.DefaultDrive = DefaultDrive;
