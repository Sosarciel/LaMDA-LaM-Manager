import type { LogLevel } from "@zwa73/utils";
import { SLogger, UtilFunc } from "@zwa73/utils";
import { type LaMPostRequestFunc, type CredProvider, type ModelInfo, type SourceProvider, LaMChain } from "LaMChain";

import type { AnyTextCompletionRequest } from "RequestFormat";
import type { TokensizerType } from "Tokensizer";

import type { InstructTaskFormatter } from "Task/Instruct/Adapter";
import type { InstructTaskOption } from "Task/Instruct/Interface";

/**构建FIM模式的提示文本 (prompt + prefix) */
export function buildFIMPrompt(opt: InstructTaskOption): string {
    if (opt.prefix) {
        return `${opt.prompt}${opt.prefix}`;
    }
    return opt.prompt;
}

/**验证任务选项 */
export function validateInstructOption(opt: InstructTaskOption): boolean {
    return typeof opt.prompt === "string" && opt.prompt.length > 0;
}

/**通用的指导式任务执行器 由formatter自管流程 */
export const commonInstructTask = <
REQ extends AnyTextCompletionRequest,
P extends LaMPostRequestFunc<REQ,any>,
>(param1:{
    tool:InstructTaskFormatter<REQ,any>;
    post: P;
})=>async (param2:{
    cred:CredProvider;
    source:SourceProvider;
    model:ModelInfo;
    option:InstructTaskOption;
    tokensizerType:TokensizerType;
    logLevel:LogLevel;
})=>{
    const {tool} = param1;
    const {cred,source,model,option,tokensizerType,logLevel} = param2;
    const json = await tool.formatOption({
        option,
        modelId:model.id,
        tokensizerType,
    });
    if(json===undefined) return undefined;

    if(logLevel!='none')
        SLogger.log(logLevel??'none',`参数: ${UtilFunc.stringifyJToken(json,{compress:true,space:2})}`);

    const resp = await param1.post({
        cred,source,model,json,
    });

    return tool.formatResult(resp);
};

/**OpenAI 样式的指导式任务执行器 */
export const commonOpenAIInstructTask = (tool:InstructTaskFormatter<any,any>)=>
    commonInstructTask({tool,post:LaMChain.postOpenAIRequest});
