"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensizerMap = void 0;
exports.getTokensizer = getTokensizer;
const fs_1 = __importDefault(require("fs"));
const tokenizers_1 = require("@anush008/tokenizers");
const utils_1 = require("@zwa73/utils");
const pathe_1 = __importDefault(require("pathe"));
const Constant_1 = require("../Constant");
class Cl100kBase {
    async encode(str) {
        return Array.from(await utils_1.UtilCodec.encodeTokenTurbo(str));
    }
    async decode(str) {
        return utils_1.UtilCodec.decodeTokenTurbo(str);
    }
    async counting(str) {
        return utils_1.UtilCodec.tokenNumTurbo(str);
    }
}
class P50kBase {
    async encode(str) {
        return Array.from(await utils_1.UtilCodec.encodeTokenDavinci(str));
    }
    async decode(str) {
        return utils_1.UtilCodec.decodeTokenDavinci(str);
    }
    async counting(str) {
        return utils_1.UtilCodec.tokenNumDavinci(str);
    }
}
class Deepseek {
    inited;
    constructor() {
        this.inited = (0, utils_1.ivk)(async () => {
            const fp = pathe_1.default.join(Constant_1.DATA_PATH, 'tokensizer', 'deepseek_tokenizer.json');
            const cfg = await fs_1.default.promises.readFile(fp, 'utf-8');
            return {
                tokenizer: tokenizers_1.Tokenizer.fromString(cfg)
            };
        });
    }
    async encode(str) {
        const { tokenizer } = await this.inited;
        return (await tokenizer.encode(str)).getIds();
    }
    async decode(str) {
        const { tokenizer } = await this.inited;
        return await tokenizer.decode(str, false);
    }
    async counting(str) {
        const { tokenizer } = await this.inited;
        return (await tokenizer.encode(str)).getLength();
    }
}
__decorate([
    utils_1.AwaitInited
], Deepseek.prototype, "encode", null);
exports.TokensizerMap = {
    "cl100k_base": new Cl100kBase(),
    "p50k_base": new P50kBase(),
    "deepseek": new Deepseek()
};
function getTokensizer(name) {
    return exports.TokensizerMap[name];
}
