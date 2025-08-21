import { AwaitInited, NeedInit, None, preset, PresetOption, SLogger, throwError, UtilFT, UtilFunc } from "@zwa73/utils";
import { APIPrice, APIPriceResp, AccountData } from "./Interface";
import { ServiceInsPack, ServiceManager } from "@zwa73/service-manager";
import { AccountManagerDrive } from "./Drive";
import { CredCategoryJsonTable } from "./Schema.schema";




const CtorTable = {
    Common        : async (table:AccountData)   => {
        const categoryData = await CredManager.getCategoryData(table.cred_category);
        if(categoryData==null) throwError(`CredManager.getAvailableAccount 缺少类别:${table.cred_category}`);
        return new AccountManagerDrive(categoryData,table);
    },
};
export type CredCtorTable = typeof CtorTable;

/**凭证数据 */
export type CredsData = ServiceInsPack<CredCtorTable>;

const CredsManagerOption = preset<{
    /**配置表单路径 */
    tablePath:string;
    /**类别表单路径 */
    categoryTablePath:string;
    /**自动保存间隔 毫秒 <10_000 时不自动保存 默认-1 */
    saveInterval:number;
}>()({
    saveInterval:-1,
}as const);

/**credentials_manager 凭证管理器 需先调用init */
class _CredManager implements NeedInit{
    readonly sm;
    readonly _categoryTable;
    inited;
    //#region 构造函数
    constructor(opt:PresetOption<typeof CredsManagerOption>){
        const {categoryTablePath,tablePath,saveInterval} = CredsManagerOption.assign(opt);
        this._categoryTable = UtilFT.loadJSONFile(categoryTablePath) as Promise<CredCategoryJsonTable>;
        this.sm = ServiceManager.from({
            cfgPath:tablePath,
            ctorTable:CtorTable
        });
        this.inited = this.sm.inited;
        //自动保存
        this.autoSave(saveInterval);
    }
    /**自动保存定时器 */
    private _autoSaveTimer:undefined|NodeJS.Timeout;
    //#endregion
    async getCategoryData(category:string){
        return (await this._categoryTable).category_table[category];
    }
    /**按照优先级获取第一个有效账户
     * @param accountType - 账户类型 按优先级排列
     */
    @AwaitInited
    async getAvailableAccount(...accountType:string[]){
        const ac = (await Promise.all(accountType
            .map(async t=>await this.sm.getServiceList(
                sd=>sd.instance.getData().cred_category===t &&
                    sd.instance.getData().is_available===true
            )))).flat();
        return ac.length>=1 ? ac[0] : None;
    }
    /**计费
     * @param accountData     - 账户数据对象
     * @param price           - API的调用价格
     * @param promptCount     - 输入/prompt_tokens
     * @param completionCount - 输出/completion_tokens
     */
    @AwaitInited
    async calcPrice(accountData:CredsData,price:APIPrice,usage:APIPriceResp){
        const promptCount = usage.prompt_cache_miss_tokens ?? usage.prompt_tokens;
        const cachedPromptCount = usage.prompt_cache_hit_tokens ?? 0;
        const completionCount = usage.completion_tokens;
        const totalPrice =
            (promptCount*price.promptPrice)+
            (completionCount*price.completionPrice)+
            (cachedPromptCount*(price.cacheHitPromptPrice??0));
        if(isNaN(totalPrice)){
            SLogger.error(`CredManager.calcPrice 错误 无法计算价格`);
            SLogger.error(usage);
            return;
        }
        await accountData.instance.addPrice(totalPrice);
    }
    /**打印已使用的USD数量
     * @param accountData - 账户数据对象
     */
    @AwaitInited
    async currUsedUSD(accountData:CredsData){
        const credit = (accountData.instance.getData().used_credit??0)/1000;
        SLogger.info(`${accountData.type}: ${accountData.name} 当前理论使用量: ${credit} USD`);
    }

    //#region 保存
    /**自动保存设定 秒
     * @param time - 自动保存间隔
     */
    autoSave(time:number){
        //最低10秒
        if(time<10_000) return;
        const bot = this;
        if(this._autoSaveTimer!=null)
            clearInterval(this._autoSaveTimer);
        this._autoSaveTimer = setInterval(() => {
            void bot.save();
        }, time);
    }
    /**保存凭证数据 */
    async save(){
        //只在实际写入时打印
        if(await this.sm.save())
            SLogger.info("CredManager.save 完成保存");
    }
    //#endregion
}

/**credentials_manager 凭证管理器 */
export const CredManager = UtilFunc.createInjectable({
    initInject:(opt:PresetOption<typeof CredsManagerOption>)=>{
        return new _CredManager(opt);
    }
})
export type CredManager = typeof CredManager;
