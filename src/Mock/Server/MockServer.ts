// mock-server.ts
import type { Server } from "http";
import { createServer } from "http";
import { parse } from 'url';

import { match, SLogger } from "@zwa73/utils";

import { procGemini } from "./GeminiRequester";
import { procOpenAIChat, procOpenAIText } from "./OpenAIRequester";

export class LaMManagerMockServer{
    server:Server|undefined;
    constructor(private port:number){}
    /**启动测试服务器 */
    async start(){
        const server = createServer((req, res) => {
            const { pathname } = parse(req.url || '', true);
            // 设置响应头
            res.setHeader("Content-Type", "application/json");
            if(req.method === "GET") return res.end();

            // 路由模拟
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", async () => {
                SLogger.info('pathname',pathname);
                SLogger.info('body',body);
                const data = JSON.parse(body || "{}");
                let result = {};
                const path = pathname ?? '';

                // 检查是否是 Gemini API 路径 (例如: /v1beta/models/gemini-3-pro-preview:generateContent)
                const geminiMatch = path.match(/^\/v1beta\/models\/([^\/:]+)(?::generateContent)?/);
                if (geminiMatch) {
                    const modelId = geminiMatch[1]; // 提取模型ID
                    result = procGemini(modelId, data);
                } else {
                    result = await match(path,{
                        '/v1/chat/completions':()=>procOpenAIChat(data),
                        '/v1/completions':()=>procOpenAIText(data),
                    },()=>{
                        SLogger.warn(`req 错误 不支持的pathname`);
                        return {};
                    });
                }
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        });
        return new Promise((resolve)=>server.listen(this.port, () => {
            console.log(`测试服务器开始运行于 http://localhost:${this.port}`);
            this.server = server;
            resolve(server);
        }));
    }
    /**停止服务器 */
    async stop(){
        if(this.server==undefined) return;
        return new Promise((resolve)=>this.server?.close(() => {
            console.log(`测试服务器已停止`);
            resolve(this.server);
        }));
    }
}
