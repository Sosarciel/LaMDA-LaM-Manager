// mock-server.ts
import { createServer } from "http";
import { parse } from "url";


export const MockServerPort = 3000;
const server = createServer((req, res) => {
    // 设置响应头
    res.setHeader("Content-Type", "application/json");
    if(req.method === "GET") return;

    // 路由模拟
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
        console.log(body);
        const data = JSON.parse(body || "{}");
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, token: "mock-token", user: data.username }));
    });
});

server.listen(MockServerPort, () => {
    console.log(`Mock server running at http://localhost:${MockServerPort}`);
});
