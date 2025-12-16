"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaMManagerMockServer = void 0;
const http_1 = require("http");
const url_1 = require("url");
const utils_1 = require("@zwa73/utils");
const OpenAIRequester_1 = require("./OpenAIRequester");
class LaMManagerMockServer {
    port;
    server;
    constructor(port) {
        this.port = port;
    }
    /**启动测试服务器 */
    async start() {
        const server = (0, http_1.createServer)((req, res) => {
            const { pathname } = (0, url_1.parse)(req.url || '', true);
            // 设置响应头
            res.setHeader("Content-Type", "application/json");
            if (req.method === "GET")
                return res.end();
            // 路由模拟
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", async () => {
                utils_1.SLogger.info('pathname', pathname);
                utils_1.SLogger.info('body', body);
                const data = JSON.parse(body || "{}");
                const result = await (0, utils_1.match)(pathname ?? '', {
                    '/v1/chat/completions': () => (0, OpenAIRequester_1.procOpenAIChat)(data),
                    '/v1/completions': () => (0, OpenAIRequester_1.procOpenAIChat)(data),
                }, () => {
                    utils_1.SLogger.warn(`req 错误 不支持的pathname`);
                    return {};
                });
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        });
        return new Promise((resolve) => server.listen(this.port, () => {
            console.log(`测试服务器开始运行于 http://localhost:${this.port}`);
            resolve(server);
        }));
    }
    /**停止服务器 */
    async stop() {
        if (this.server == undefined)
            return;
        return new Promise((resolve) => this.server?.close(() => {
            console.log(`测试服务器已停止`);
            resolve(this.server);
        }));
    }
}
exports.LaMManagerMockServer = LaMManagerMockServer;
