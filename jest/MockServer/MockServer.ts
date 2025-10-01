// mock-server.ts
import { match, SLogger } from "@zwa73/utils";
import { createServer } from "http";
import { parse } from 'url';
import { procOpenAIChat } from "./OpenAIChat";


export const MockServerPort = 3000;
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
        },()=>{
            SLogger.warn(`req 错误 不支持的pathname`);
            return {};
        });
        res.writeHead(200);
        res.end(JSON.stringify(result));
    });
});

export const startServer = ()=> server.listen(MockServerPort, () => {
    console.log(`Mock server running at http://localhost:${MockServerPort}`);
});
export const stopServer = ()=> server.close();
