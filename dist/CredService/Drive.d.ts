import type { AccountData, AccountManager, AccountCategoryData } from "./Interface";
/**基本的账户管理器 */
export declare class AccountManagerDrive implements AccountManager {
    categoryData: AccountCategoryData;
    keyIdx: number;
    uid: string;
    /** 构造函数 */
    constructor(categoryData: AccountCategoryData, accountTable: AccountData);
    /**APIKey文件数据 */
    protected _accountTable: AccountData;
    getData(): {
        api_key: string | string[];
        is_available?: boolean;
        used_credit?: number;
        credit_limit?: number;
        cred_category: string;
    };
    getKey(): string;
    isRuning(): boolean;
    addPrice(price: number): Promise<void>;
    checkAccount(): Promise<boolean>;
    /**检测使用量，并设置无效
     * @param accountName - APIKey name
     */
    protected checkTokenCount(): Promise<void>;
    setInavailable(): Promise<void>;
    saveToJson(): AccountData;
}
