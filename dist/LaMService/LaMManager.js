"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaMManager = void 0;
const service_manager_1 = require("@zwa73/service-manager");
const utils_1 = require("@zwa73/utils");
const ModelDrive_1 = require("../ModelDrive");
const DefaultDrive_1 = require("../ModelDrive/DefaultDrive");
const LaMInterface_1 = require("./LaMInterface");
const CtorTable = {
    HttpAPIModel: async (d) => (0, LaMInterface_1.expandDrive)(new ModelDrive_1.HttpAPIModelDrive(d)),
    Test: async () => (0, LaMInterface_1.expandDrive)(new ModelDrive_1.TestModule()),
};
class _LaMManager {
    sm;
    constructor(opt) {
        const { tablePath } = opt;
        this.sm = service_manager_1.ServiceManager.from({
            cfgPath: tablePath,
            ctorTable: CtorTable
        });
    }
    /**获取指定实例的默认选项 */
    async getDefaultOption(instanceName) {
        const res = await this.sm.invoke(instanceName, 'getDefaultOption');
        if (res === utils_1.None) {
            utils_1.SLogger.warn(`LaMManager.getDefaultOption 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
    /**token编码
     * @async
     * @param instanceName - 目标实例名
     * @param str - 待编码的字符串
     * @returns token数组 null为计算错误
     */
    async encodeToken(instanceName, str) {
        const res = await this.sm.invoke(instanceName, 'encodeToken', str);
        if (res === utils_1.None) {
            utils_1.SLogger.warn(`LaMManager.encodeToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
    /**token解码
     * @async
     * @param instanceName - 目标实例名
     * @param arr - 待解码的token数组
     * @returns 解码的字符串 null为计算错误
     */
    async decodeToken(instanceName, arr) {
        const res = await this.sm.invoke(instanceName, 'decodeToken', arr);
        if (res === utils_1.None) {
            utils_1.SLogger.warn(`LaMManager.calcToken 错误 instanceName:${instanceName} 不存在`);
            return undefined;
        }
        return res;
    }
}
//构造代理
const defDrive = new DefaultDrive_1.DefaultDrive();
const TaskProxyCache = {};
const proxyCtor = (mgr) => {
    return new Proxy(mgr, {
        get(target1, prop1, receiver1) {
            if (typeof prop1 != 'string' || prop1 in target1)
                return Reflect.get(target1, prop1, receiver1);
            //基于taskName创建代理
            return TaskProxyCache[prop1] ??= new Proxy({}, {
                get(target2, prop2, receiver2) {
                    if (typeof prop2 != 'string')
                        return undefined;
                    return async (instanceName, ...args) => {
                        if (!await mgr.sm.hasService(instanceName)) {
                            utils_1.SLogger.warn(`LaMManager.${prop1}.${prop2} 错误 instanceName:${instanceName} 不存在, 将使用默认驱动器`);
                            return defDrive[prop1][prop2](instanceName, ...args);
                        }
                        return await mgr.sm.invoke(instanceName, `${prop1}-${prop2}`, ...args);
                    };
                },
            });
        }
    });
};
/**语言模型管理器 需先调用init */
exports.LaMManager = utils_1.UtilFunc.createInjectable({
    initInject: (opt) => {
        return proxyCtor(new _LaMManager(opt));
    }
});
