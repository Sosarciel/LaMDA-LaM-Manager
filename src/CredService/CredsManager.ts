import { AwaitInited, NeedInit, None, SLogger, throwError } from "@zwa73/utils";
import { APIPrice, APIPriceResp, AccountData, AccountManager, CredsType } from "./CredsInterface";
import { ServiceConfig, ServiceInstance, ServiceManager, ServiceManagerBaseConfig } from "@zwa73/service-manager";
import { DeepseekOption, DoubleGPTOption, Eylink4Option, EylinkAzOption, EylinkOption, GoogleOption, GptgeOption, GptusOption, OpenAIOption, SiliconFlowOption } from "./CredsOption";
import { AccountManagerDrive } from "./CredsManagerBase";




const CtorTable = {
    OpenAI      : (table:AccountData)   => new AccountManagerDrive(OpenAIOption,table),
    DoubleGPT   : (table:AccountData)   => new AccountManagerDrive(DoubleGPTOption,table),
    Eylink      : (table:AccountData)   => new AccountManagerDrive(EylinkOption,table),
    Eylink4     : (table:AccountData)   => new AccountManagerDrive(Eylink4Option,table),
    EylinkAz    : (table:AccountData)   => new AccountManagerDrive(EylinkAzOption,table),
    Gptus       : (table:AccountData)   => new AccountManagerDrive(GptusOption,table),
    Gptge       : (table:AccountData)   => new AccountManagerDrive(GptgeOption,table),
    Deepseek    : (table:AccountData)   => new AccountManagerDrive(DeepseekOption,table),
    SiliconFlow : (table:AccountData)   => new AccountManagerDrive(SiliconFlowOption,table),
    Google      : (table:AccountData)   => new AccountManagerDrive(GoogleOption,table),
};
type CtorTable = typeof CtorTable;

export type CredsManagerJsonTable =  ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<CtorTable>;
    };
}

/**凭证数据 */
export type CredsData = ServiceInstance<CtorTable,AccountManager>;

/**credentials_manager 凭证管理器 需先调用init */
class _CredsManager implements NeedInit{
    readonly sm;
    inited;
    //#region 构造函数
    constructor(tablePath:string){
        this.sm = ServiceManager.from<CtorTable,AccountManager>({
            cfgPath:tablePath,
            ctorTable:CtorTable
        });
        this.inited = this.sm.inited;
        //自动保存
        this.autoSave(300);
    }
    /**自动保存定时器 */
    private _autoSaveTimer:undefined|NodeJS.Timeout;
    //#endregion
    /**按照优先级获取第一个有效账户
     * @param accountType - 账户类型 按优先级排列
     */
    @AwaitInited
    async getAvailableAccount(...accountType:CredsType[]){
        const ac = (await Promise.all(accountType
            .map(async t=>await this.sm.getServiceList(
                sd=>sd.type===t && sd.instance.getData().is_available===true
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
            SLogger.error(`CredsManager.calcPrice 错误 无法计算价格`);
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
        const bot = this;
        if(time<10)//最低10秒
            time=10;

        if(this._autoSaveTimer!=null)
            clearInterval(this._autoSaveTimer);
        this._autoSaveTimer = setInterval(() => {
            void bot.save();
        }, time * 1000);
    }
    /**保存凭证数据 */
    async save(){
        await this.sm.save();
        SLogger.info("CredsManager.save 完成保存");
    }
    //#endregion
}

/**credentials_manager 凭证管理器 */
export type CredsManager = _CredsManager&{init:(tablePath: string)=>void};
export const CredsManager = new Proxy({} as {ins?:_CredsManager}, {
    get(target, prop, receiver) {
        if (prop === 'init') {
            return (tablePath: string) => {
                if (target.ins==null)
                    target.ins = new _CredsManager(tablePath);
            };
        }
        if (target.ins==null) throwError("CredsManager 未初始化", 'error');
        return Reflect.get(target.ins!, prop, receiver);
    }
}) as any as CredsManager;
