import { LaMManagerMockTool } from "Mock/Utils";

/**处理 OpenAI Instruct 请求 */
export const procOpenAIInstruct = (data: any) => {
    if (!data || typeof data.prompt !== "string") {
        return {};
    }

    // 提取模型名称（从实例名称中获取）
    let modelName = data.model || "OpenAIInstruct";
    
    // 构建响应
    return {
        id: `chatcmpl-${Date.now()}`,
        object: "text_completion",
        created: Math.floor(Date.now() / 1000),
        model: data.model,
        choices: [
            {
                text: LaMManagerMockTool.buildResp(modelName, data.prompt),
                index: 0,
                logprobs: null,
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: data.prompt.length,
            completion_tokens: 10,
            total_tokens: data.prompt.length + 10
        }
    };
};
