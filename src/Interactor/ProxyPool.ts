
import type { PRecord } from '@zwa73/utils';
import { match } from '@zwa73/utils';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';



const ProxyPool = {
    http:{} as PRecord<string, HttpProxyAgent<string>>,
    https:{} as PRecord<string, HttpsProxyAgent<string>>
};
export const getProxy = (type:'http'|'https',url:string)=>{
    return match(type,{
        http:()=>ProxyPool.http[url] ?? (ProxyPool.http[url] = new HttpProxyAgent(url)),
        https:()=>ProxyPool.https[url] ?? (ProxyPool.https[url] = new HttpsProxyAgent(url)),
    });
};