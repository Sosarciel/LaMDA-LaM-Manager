"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTypeList = exports.DefChatLaMResult = void 0;
const utils_1 = require("@zwa73/utils");
/**空结果 */
exports.DefChatLaMResult = { completed: undefined, pending: [] };
/**task类型 列表 */
exports.TaskTypeList = ['chat'];
(0, utils_1.assertType)(exports.TaskTypeList);
