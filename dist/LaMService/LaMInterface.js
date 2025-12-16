"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandDrive = void 0;
const Task_1 = require("../Task");
/**展开驱动器为扁平接口 */
const expandDrive = (d) => {
    return new Proxy(d, {
        get(target, prop, receiver) {
            if (typeof prop != 'string' || prop in target)
                return Reflect.get(target, prop, receiver);
            const match = prop.match(/(.+)-(.+)/);
            if (match == null)
                return undefined;
            const [_, task, func] = match;
            const taskObj = target[task];
            if (Task_1.TaskTypeList.includes(task) && typeof taskObj[func] == 'function')
                return (...args) => taskObj[func](...args);
        }
    });
};
exports.expandDrive = expandDrive;
