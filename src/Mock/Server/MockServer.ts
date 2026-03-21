import type { Server } from "http";
import { createServer } from "http";
import { parse } from 'url';

import { SLogger } from "@zwa73/utils";

export class LaMManagerMockServer{
    server:Server|undefined;
    constructor(private port:number){}

    /**启动测试服务器 */
    async start(){
        const server = createServer((req, res) => {
            const { pathname } = parse(req.url || '', true);
            res.setHeader("Content-Type", "application/json");
            if(req.method === "GET") return res.end();

            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", async () => {
                SLogger.info('pathname',pathname);
                SLogger.info('body',body);
                const data = JSON.parse(body || "{}");
                const path = pathname ?? '';

                const modelId = this.extractModelId(path, data);
                const result = this.buildResponse(modelId);

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

    /**从请求中提取modelId */
    private extractModelId(path: string, data: any): string {
        if (data.model) return data.model;
        const geminiMatch = path.match(/\/v1beta\/models\/([^\/:]+)/);
        if (geminiMatch) return geminiMatch[1];
        return "unknown";
    }

    /**构建简单响应 */
    private buildResponse(modelId: string): any {
        if (modelId.includes('gemini')) {
            return {
                candidates: [{
                    content: {
                        parts: [{ text: `对 ${modelId} 反馈` }],
                        role: "model"
                    },
                    finishReason: "STOP"
                }],
                usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 }
            };
        }
        return {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: modelId,
            choices: [{
                index: 0,
                message: { role: "assistant", content: `对 ${modelId} 反馈` },
                finish_reason: "stop"
            }],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        };
    }
}
