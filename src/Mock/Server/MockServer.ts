// mock-server.ts
import { match, SLogger } from "@zwa73/utils";
import { createServer } from "http";
import { parse } from 'url';
import { procOpenAIChat } from "./OpenAIRequester";
import { LaMManagerMock } from "../Utils";


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
        const result = await match(pathname??'',{
            '/v1/chat/completions':()=>procOpenAIChat(data),
            '/v1/completions':()=>procOpenAIChat(data),
        },()=>{
            SLogger.warn(`req 错误 不支持的pathname`);
            return {};
        });
        res.writeHead(200);
        res.end(JSON.stringify(result));
    });
});

/**启动测试服务器 */
export const startServer = async (port?:number)=> new Promise((resolve)=>server.listen(port??LaMManagerMock.MOCK_PORT, () => {
    console.log(`测试服务器开始运行于 http://localhost:${port??LaMManagerMock.MOCK_PORT}`);
    resolve(server);
}));

/**停止服务器 */
export const stopServer = async ()=> new Promise((resolve)=>server.close(() => {
    console.log(`测试服务器已停止`);
    resolve(server);
}));
