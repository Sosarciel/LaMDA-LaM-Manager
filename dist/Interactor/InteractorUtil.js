"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRespCode = void 0;
/**检查响应码是否合规
 * @param respData - 响应数据
 */
const checkRespCode = (respData) => {
    const respcode = respData?.statusCode ?? 0;
    return respcode >= 200 && respcode < 300;
};
exports.checkRespCode = checkRespCode;
