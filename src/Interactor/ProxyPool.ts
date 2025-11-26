
import type {HttpsProxyAgent} from 'https-proxy-agent';
import createHttpsProxyAgent from 'https-proxy-agent';
import type { HttpProxyAgent } from 'http-proxy-agent';
import createHttpProxyAgent from 'http-proxy-agent';
import type { PRecord } from '@zwa73/utils';
import { match } from '@zwa73/utils';



const ProxyPool = {
    http:{} as PRecord<string, HttpProxyAgent>,
    https:{} as PRecord<string, HttpsProxyAgent>
};
export const getProxy = (type:'http'|'https',url:string)=>{
    return match(type,{
        http:()=>ProxyPool.http[url] ?? (ProxyPool.http[url] = createHttpProxyAgent(url)),
        https:()=>ProxyPool.https[url] ?? (ProxyPool.https[url] = createHttpsProxyAgent(url)),
    });
};