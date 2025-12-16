"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAPIModelDrive = void 0;
const utils_1 = require("@zwa73/utils");
const CredService_1 = require("../../CredService");
const Interactor_1 = require("../../Interactor");
const Task_1 = require("../../Task");
const Tokensizer_1 = require("../../Tokensizer");
const DefaultDrive_1 = require("../DefaultDrive");
const ChatTask_1 = require("./ChatTask");
/**适用于网络API的文本完成模型驱动器 */
class HttpAPIModelDrive extends DefaultDrive_1.DefaultDrive {
    data;
    chatFormater;
    interactor;
    chat = (0, ChatTask_1.chatTaskCtor)(this);
    constructor(data) {
        super();
        this.data = data;
        this.chatFormater = Task_1.ChatTaskFormaterTable[this.data.config.chat_formater];
        this.interactor = Interactor_1.InteractorTable[this.data.config.interactor];
    }
    isRuning() { return true; }
    getData() { return this.data; }
    getDefaultOption() {
        return this.data.default_option ?? {};
    }
    async decodeToken(arr) {
        const tokenizer = (0, Tokensizer_1.getTokensizer)(this.data.config.tokensizer);
        return tokenizer.decode(arr);
    }
    async encodeToken(str) {
        const tokenizer = (0, Tokensizer_1.getTokensizer)(this.data.config.tokensizer);
        return tokenizer.encode(str);
    }
    /**task共用请求 */
    async commonTask(opt, formatter) {
        //路由api key 获取有效keyname
        const vaildAccount = this.data.config.valid_account;
        const accountData = await CredService_1.CredManager.getAvailableAccount(...(opt.preferred_account ?? []).filter(v => vaildAccount.includes(v)), ...vaildAccount);
        if (accountData == utils_1.None) {
            utils_1.SLogger.warn(`DeepseekChat.chat 错误 无有效账号`);
            return Task_1.DefChatLaMResult;
        }
        utils_1.SLogger.info(`当前 account_category: ${accountData.instance.getData().cred_category} account_name: ${accountData.name}`);
        const chatOption = await formatter.formatOption(opt, this.data.config.id);
        if (chatOption === undefined)
            return Task_1.DefChatLaMResult;
        const fixedOption = (0, utils_1.ivk)(() => {
            const out = { ...chatOption };
            if (utils_1.UtilFunc.checkSharpSchema(out, { model: "string" })) {
                const mapname = accountData.instance.categoryData.model_id_map?.[out.model];
                if (mapname != null)
                    out.model = mapname;
            }
            return out;
        });
        if (fixedOption === undefined)
            return Task_1.DefChatLaMResult;
        if (opt.log_level != 'none') {
            utils_1.SLogger.log(opt.log_level, `参数: ${utils_1.UtilFunc.stringifyJToken(fixedOption, { compress: true, space: 2 })}`);
        }
        //重复请求
        const resp = await this.interactor.postLaMRepeat({
            accountData,
            postJson: fixedOption,
            modelData: this.data.config,
            retryOption: accountData.instance.categoryData.retry,
        });
        return formatter.formatResult(resp);
    }
}
exports.HttpAPIModelDrive = HttpAPIModelDrive;
