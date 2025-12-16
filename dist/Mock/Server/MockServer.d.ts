import type { Server } from "http";
export declare class LaMManagerMockServer {
    private port;
    server: Server | undefined;
    constructor(port: number);
    /**启动测试服务器 */
    start(): Promise<unknown>;
    /**停止服务器 */
    stop(): Promise<unknown>;
}
