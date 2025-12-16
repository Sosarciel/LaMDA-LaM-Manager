import type { ServiceInsPack } from "@zwa73/service-manager";
import { ServiceManager } from "@zwa73/service-manager";
import type { NeedInit, PresetOption } from "@zwa73/utils";
import { None } from "@zwa73/utils";
import { AccountManagerDrive } from "./Drive";
import type { APIPriceResp, APIPrice, AccountData } from "./Interface";
import type { CredCategoryJsonTable } from "./Schema.schema";
declare const CtorTable: {
    Common: (table: AccountData) => Promise<AccountManagerDrive>;
};
export type CredCtorTable = typeof CtorTable;
/**凭证数据 */
export type CredsData = ServiceInsPack<CredCtorTable>;
declare const CredsManagerOption: import("@zwa73/utils").Preset<{
    /**配置表单路径 */
    tablePath: string;
    /**类别表单路径 */
    categoryTablePath: string;
    /**自动保存间隔 毫秒 <10_000 时不自动保存 默认-1 */
    saveInterval: number;
}, {
    readonly saveInterval: -1;
}>;
/**credentials_manager 凭证管理器 需先调用init */
declare class _CredManager implements NeedInit {
    readonly sm: ServiceManager<{
        Common: (table: AccountData) => Promise<AccountManagerDrive>;
    }>;
    readonly _categoryTable: Promise<CredCategoryJsonTable>;
    inited: Promise<void>;
    constructor(opt: PresetOption<typeof CredsManagerOption>);
    /**自动保存定时器 */
    private _autoSaveTimer;
    getCategoryData(category: string): Promise<import("./Interface").AccountCategoryData>;
    /**按照优先级获取第一个有效账户
     * @param accountType - 账户类型 按优先级排列
     */
    getAvailableAccount(...accountType: string[]): Promise<ServiceInsPack<{
        Common: (table: AccountData) => Promise<AccountManagerDrive>;
    }, "Common"> | typeof None>;
    /**计费
     * @param accountData     - 账户数据对象
     * @param price           - API的调用价格
     * @param promptCount     - 输入/prompt_tokens
     * @param completionCount - 输出/completion_tokens
     */
    calcPrice(accountData: CredsData, price: APIPrice, usage: APIPriceResp): Promise<void>;
    /**打印已使用的USD数量
     * @param accountData - 账户数据对象
     */
    currUsedUSD(accountData: CredsData): Promise<void>;
    /**自动保存设定 秒
     * @param time - 自动保存间隔
     */
    autoSave(time: number): void;
    /**保存凭证数据 */
    save(): Promise<void>;
}
/**credentials_manager 凭证管理器 */
export declare const CredManager: _CredManager & {
    initInject: (opt: Omit<Omit<{
        /**配置表单路径 */
        tablePath: string;
        /**类别表单路径 */
        categoryTablePath: string;
        /**自动保存间隔 毫秒 <10_000 时不自动保存 默认-1 */
        saveInterval: number;
    }, "saveInterval"> & Partial<Pick<{
        /**配置表单路径 */
        tablePath: string;
        /**类别表单路径 */
        categoryTablePath: string;
        /**自动保存间隔 毫秒 <10_000 时不自动保存 默认-1 */
        saveInterval: number;
    }, "saveInterval">>, never>) => void;
    waitInitInject: () => Promise<void>;
};
export type CredManager = typeof CredManager;
export {};
