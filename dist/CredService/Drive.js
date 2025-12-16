"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManagerDrive = void 0;
const utils_1 = require("@zwa73/utils");
/**基本的账户管理器 */
class AccountManagerDrive {
    categoryData;
    keyIdx = 0;
    uid;
    /** 构造函数 */
    constructor(categoryData, accountTable) {
        this.categoryData = categoryData;
        this._accountTable = accountTable;
        this.uid = JSON.stringify(this._accountTable.api_key);
    }
    /**APIKey文件数据 */
    _accountTable;
    getData() {
        return { ...this._accountTable };
    }
    getKey() {
        if (Array.isArray(this._accountTable.api_key)) {
            const out = this._accountTable.api_key[this.keyIdx];
            this.keyIdx++;
            if (this.keyIdx >= this._accountTable.api_key.length)
                this.keyIdx = 0;
            return out;
        }
        return this._accountTable.api_key;
    }
    isRuning() {
        return true;
    }
    async addPrice(price) {
        //计费
        const preUsed = this._accountTable.used_credit ?? 0;
        const currUsed = preUsed + price;
        this._accountTable.used_credit = currUsed;
        await this.checkAccount();
    }
    async checkAccount() {
        //必要key
        const needList = ['api_key'];
        let avile = true;
        for (const needkey of needList) {
            if (this._accountTable[needkey] == null) {
                utils_1.SLogger.warn(`KEYObj ${this.uid} 缺少:${needkey}`);
                avile = false;
            }
        }
        //使用量
        await this.checkTokenCount();
        //是否有效
        if (this._accountTable.is_available == false) {
            utils_1.SLogger.warn(`KEYObj ${this.uid} 不可用`);
            return false;
        }
        return avile;
    }
    /**检测使用量，并设置无效
     * @param accountName - APIKey name
     */
    async checkTokenCount() {
        //默认额度 5000 * 1/1000 usd
        const vaildCredit = 5000;
        const limit = this._accountTable.credit_limit ?? vaildCredit;
        const used = this._accountTable.used_credit;
        if (used != null && used >= limit)
            await this.setInavailable();
    }
    async setInavailable() {
        this._accountTable.is_available = false;
    }
    saveToJson() {
        return this._accountTable;
    }
}
exports.AccountManagerDrive = AccountManagerDrive;
