import { LaMManagerMockServer } from "Mock/Server";


const server:LaMManagerMockServer = new LaMManagerMockServer(3000);
void server.start();