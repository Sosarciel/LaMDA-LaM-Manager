"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatTaskCtor = void 0;
const Task_1 = require("../../Task");
const chatTaskCtor = (drive) => {
    return {
        async countToken(message) {
            return drive.chatFormater.calcToken(message, drive.getData().config.tokensizer);
        },
        async execute(opt) {
            const fopt = Task_1.ChatTaskOptionPreset.assign(opt);
            return drive.commonTask(fopt, drive.chatFormater);
        }
    };
};
exports.chatTaskCtor = chatTaskCtor;
