import { SLogger } from "@zwa73/utils";
import { AccountData, AccountManager, AccountPostOption } from "./CredsInterface";


/**基本的账户管理器 */
export class AccountManagerDrive implements AccountManager{
    postOption: AccountPostOption;
    keyIdx = 0;
    uid:string;
    /** 构造函数 */
    constructor(option:AccountPostOption,accountTable:AccountData){
        this.postOption = option;
        this._accountTable = accountTable;
        this.uid = JSON.stringify(this._accountTable.api_key);
    }
    /**APIKey文件数据 */
    protected _accountTable :AccountData;

    getData(){
        return {...this._accountTable};
    }

    getKey(){
        if(Array.isArray(this._accountTable.api_key)){
            const out = this._accountTable.api_key[this.keyIdx];
            this.keyIdx++;
            if(this.keyIdx>=this._accountTable.api_key.length)
                this.keyIdx = 0;
            return out;
        }
        return this._accountTable.api_key;
    }

    isRuning(){
        return true;
    }

    async addPrice(price:number){
        //计费
        const preUsed = this._accountTable.used_credit ?? 0;
        const currUsed = preUsed + price;
        this._accountTable.used_credit = currUsed;
        await this.checkAccount();
    }
    async checkAccount(){
        //必要key
        const needList:(keyof AccountData)[] = ['api_key'];
        let avile = true;
        for(const needkey of needList){
            if((this._accountTable as any)[needkey]==null){
                SLogger.warn(`KEYObj ${this.uid} 缺少:${needkey}`);
                avile = false;
            }
        }
        //使用量
        await this.checkTokenCount();
        //是否有效
        if(this._accountTable.is_available==false){
            SLogger.warn(`KEYObj ${this.uid} 不可用`);
            return false;
        }
        return avile;
    }
    /**检测使用量，并设置无效
     * @param accountName - APIKey name
     */
    protected async checkTokenCount(){
        //默认额度 5000 * 1/1000 usd
        const vaildCredit = 5000;

        const limit = this._accountTable.credit_limit ?? vaildCredit;
        const used = this._accountTable.used_credit;
        if(used!=null && used>=limit)
            await this.setInavailable();
    }
    async setInavailable(){
        this._accountTable.is_available=false;
    }
    saveToJson(){
        return this._accountTable;
    }
}