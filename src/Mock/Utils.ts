import { DATA_PATH } from 'Constant';
import path from 'pathe';


export namespace LaMManagerMock{

    export const MOCK_PATH = path.join(DATA_PATH,'mock');
    export const MOCK_USER = "mock_user";
    export const MOCK_CHAR = "mock_char";
    export const MOCK_PORT = 3000;

    /**构建一个响应 */
    export const buildResp = (id:string,msg?:string)=>{
        return `来自 ${id} 对 ${msg??"未定义消息"} 的响应`;
    };
}