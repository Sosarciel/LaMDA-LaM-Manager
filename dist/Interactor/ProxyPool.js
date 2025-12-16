"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProxy = void 0;
const utils_1 = require("@zwa73/utils");
const http_proxy_agent_1 = __importDefault(require("http-proxy-agent"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const ProxyPool = {
    http: {},
    https: {}
};
const getProxy = (type, url) => {
    return (0, utils_1.match)(type, {
        http: () => ProxyPool.http[url] ?? (ProxyPool.http[url] = (0, http_proxy_agent_1.default)(url)),
        https: () => ProxyPool.https[url] ?? (ProxyPool.https[url] = (0, https_proxy_agent_1.default)(url)),
    });
};
exports.getProxy = getProxy;
