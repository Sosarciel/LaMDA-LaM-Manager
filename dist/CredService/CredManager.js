"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredManager = void 0;
const service_manager_1 = require("@zwa73/service-manager");
const utils_1 = require("@zwa73/utils");
const Drive_1 = require("./Drive");
const CtorTable = {
    Common: async (table) => {
        const categoryData = await exports.CredManager.getCategoryData(table.cred_category);
        if (categoryData == null)
            (0, utils_1.throwError)(`CredManager.getAvailableAccount 缺少类别:${table.cred_category}`);
        return new Drive_1.AccountManagerDrive(categoryData, table);
    },
};
const CredsManagerOption = (0, utils_1.preset)()({
    saveInterval: -1,
});
/**credentials_manager 凭证管理器 需先调用init */
class _CredManager {
    sm;
    _categoryTable;
    inited;
    //#region 构造函数
    constructor(opt) {
        const { categoryTablePath, tablePath, saveInterval } = CredsManagerOption.assign(opt);
        this._categoryTable = utils_1.UtilFT.loadJSONFile(categoryTablePath);
        this.sm = service_manager_1.ServiceManager.from({
            cfgPath: tablePath,
            ctorTable: CtorTable
        });
        this.inited = this.sm.inited;
        //自动保存
        this.autoSave(saveInterval);
    }
    /**自动保存定时器 */
    _autoSaveTimer;
    //#endregion
    async getCategoryData(category) {
        return (await this._categoryTable).category_table[category];
    }
    /**按照优先级获取第一个有效账户
     * @param accountType - 账户类型 按优先级排列
     */
    async getAvailableAccount(...accountType) {
        const ac = (await Promise.all(accountType
            .map(async (t) => await this.sm.getServiceList(sd => sd.instance.getData().cred_category === t &&
            sd.instance.getData().is_available === true)))).flat();
        return ac.length >= 1 ? ac[0] : utils_1.None;
    }
    /**计费
     * @param accountData     - 账户数据对象
     * @param price           - API的调用价格
     * @param promptCount     - 输入/prompt_tokens
     * @param completionCount - 输出/completion_tokens
     */
    async calcPrice(accountData, price, usage) {
        const promptCount = usage.prompt_cache_miss_tokens ?? usage.prompt_tokens;
        const cachedPromptCount = usage.prompt_cache_hit_tokens ?? 0;
        const completionCount = usage.completion_tokens;
        const totalPrice = (promptCount * price.promptPrice) +
            (completionCount * price.completionPrice) +
            (cachedPromptCount * (price.cacheHitPromptPrice ?? 0));
        if (isNaN(totalPrice)) {
            utils_1.SLogger.error(`CredManager.calcPrice 错误 无法计算价格`);
            utils_1.SLogger.error(usage);
            return;
        }
        await accountData.instance.addPrice(totalPrice);
    }
    /**打印已使用的USD数量
     * @param accountData - 账户数据对象
     */
    async currUsedUSD(accountData) {
        const credit = (accountData.instance.getData().used_credit ?? 0) / 1000;
        utils_1.SLogger.info(`${accountData.type}: ${accountData.name} 当前理论使用量: ${credit} USD`);
    }
    //#region 保存
    /**自动保存设定 秒
     * @param time - 自动保存间隔
     */
    autoSave(time) {
        //最低10秒
        if (time < 10_000)
            return;
        const bot = this;
        if (this._autoSaveTimer != null)
            clearInterval(this._autoSaveTimer);
        this._autoSaveTimer = setInterval(() => {
            void bot.save();
        }, time);
    }
    /**保存凭证数据 */
    async save() {
        //只在实际写入时打印
        if (await this.sm.save())
            utils_1.SLogger.info("CredManager.save 完成保存");
    }
}
__decorate([
    utils_1.AwaitInited
], _CredManager.prototype, "getAvailableAccount", null);
__decorate([
    utils_1.AwaitInited
], _CredManager.prototype, "calcPrice", null);
__decorate([
    utils_1.AwaitInited
], _CredManager.prototype, "currUsedUSD", null);
/**credentials_manager 凭证管理器 */
exports.CredManager = utils_1.UtilFunc.createInjectable({
    initInject: (opt) => {
        return new _CredManager(opt);
    }
});
