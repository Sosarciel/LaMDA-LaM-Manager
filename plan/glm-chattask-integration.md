# BigModel GLM API ChatTask 接入计划

## 1. 结论先行

**GLM API 完全兼容 OpenAI 对话格式**，鉴权方式同为 `Bearer Token`，请求/响应结构与 OpenAI Chat Completions 高度一致。因此接入工作量极小，核心策略为 **复用 OpenAI 交互器 + 新增 GLM 专属 Formatter**。

## 2. GLM API 格式分析

### 2.1 请求格式

- **端点**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **鉴权**: `Authorization: Bearer {api_key}`（与 OpenAI 完全一致）
- **请求体**:

```json
{
    "model": "glm-5.1",
    "messages": [
        { "role": "system", "content": "..." },
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
    ],
    "temperature": 1.0,
    "top_p": 0.95,
    "max_tokens": 1024,
    "stop": ["stop_word1"],
    "thinking": { "type": "enabled" },
    "do_sample": true
}
```

**与 OpenAI 的差异点**:

| 特性 | OpenAI | GLM |
|------|--------|-----|
| 推理控制 | `reasoning_effort` | `thinking.type` (enabled/disabled) |
| 采样开关 | 无 | `do_sample` (boolean) |
| stop 数组 | 最多4个 | 最多1个 |
| `max_tokens` vs `max_completion_tokens` | 新版用 `max_completion_tokens` | 仅 `max_tokens` |
| `logit_bias` | 支持 | 不支持 |
| `n` | 支持 | 不支持(始终1) |
| `presence_penalty` / `frequency_penalty` | 支持 | 不支持 |

### 2.2 响应格式

```json
{
    "id": "<string>",
    "created": 123,
    "model": "glm-5.1",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "<string>",
                "reasoning_content": "<string>"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 123,
        "completion_tokens": 123,
        "total_tokens": 123,
        "prompt_tokens_details": { "cached_tokens": 123 }
    }
}
```

**与 OpenAI 的差异点**:

| 特性 | OpenAI | GLM |
|------|--------|-----|
| 推理内容 | 无独立字段 | `message.reasoning_content` |
| `system_fingerprint` | 有 | 无 |
| `n>1` 多choice | 支持 | 不支持 |

### 2.3 关键结论

GLM 响应格式与 `OpenAIChatResponse` 结构高度相似，`choices[].message.content` 提取逻辑完全一致。**可以直接复用 `OpenAiPostTool` 交互器**，因为鉴权方式和请求方式完全相同。

## 3. 需要新增/修改的文件

### 3.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `src/RequestFormat/GLM.ts` | GLM 请求类型定义 |
| `src/ResponseFormat/GLM.ts` | GLM 响应类型定义 |
| `src/Task/Chat/Formatter/GLM.ts` | GLM ChatTask Formatter |

### 3.2 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/RequestFormat/index.ts` | 导出 GLM 请求类型，加入 `AnyTextCompletionRequest` 联合类型 |
| `src/ResponseFormat/index.ts` | 导出 GLM 响应类型，加入 `AnyTextCompletionResponse` 联合类型 |
| `src/Task/Chat/Formatter/index.ts` | 导出 GLM Formatter |
| `src/Task/Chat/Adapter.ts` | 在 `ChatTaskFormaterTable` 中注册 `glm_chat` |

### 3.3 无需修改的文件

| 文件路径 | 原因 |
|----------|------|
| `src/Interactor/Adapter.ts` | 直接复用 `openai` 交互器 |
| `src/Interactor/OpenAIRequester/PostTool.ts` | 鉴权方式一致，无需修改 |
| `src/ModelDrive/HttpApiModel/*` | 配置驱动，无需代码改动 |
| `src/Tokensizer/*` | 使用现有分词器即可 |

## 4. 各文件详细设计

### 4.1 `src/RequestFormat/GLM.ts`

```typescript
import { OpenAIChatAPIRole } from "./OpenAIChat";

/** GLM 模型请求格式 */
export type GLMRequest = Partial<{
    /** 模型名称 */
    model: "glm-5.1" | "glm-5-turbo" | "glm-5" | "glm-4.7" | "glm-4.6"
         | "glm-4.5-air" | "glm-4.5-airx" | "glm-4.5-flash" | string;
    /** 消息列表 */
    messages: GLMAPIEntry[];
    /** 最大生成 token 数 */
    max_tokens: number;
    /** 温度参数 (0.0, 1.0] */
    temperature: number;
    /** Top-P 采样参数 [0.01, 1.0] */
    top_p: number;
    /** 停止序列 (最多1个) */
    stop: string[] | null;
    /** 是否启用采样 */
    do_sample: boolean;
    /** 思维链控制 */
    thinking?: {
        /** 是否开启思维链 */
        type: "enabled" | "disabled";
    };
}>;

/** GLM API 消息条目 */
export type GLMAPIEntry = {
    /** 角色 */
    role: OpenAIChatAPIRole;
    /** 消息内容 */
    content: string;
};

export const GLMAPIRole = OpenAIChatAPIRole;
export type GLMAPIRole = OpenAIChatAPIRole;
```

### 4.2 `src/ResponseFormat/GLM.ts`

```typescript
/** GLM 响应格式 */
export type GLMResponse = {
    /** 响应 ID */
    id: string;
    /** 请求 ID */
    request_id?: string;
    /** 创建时间戳 */
    created: number;
    /** 模型名称 */
    model: string;
    /** 选项列表 */
    choices: GLMChatChoice[];
    /** 用量统计 */
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: { cached_tokens: number };
    };
};

/** GLM 聊天选项 */
type GLMChatChoice = {
    /** 消息 */
    message: {
        /** 角色 */
        role: "assistant";
        /** 内容 */
        content?: string;
        /** 推理内容 */
        reasoning_content?: string;
    };
    /** 完成原因 */
    finish_reason: "stop" | "length" | "content_filter";
    /** 索引 */
    index: number;
};
```

### 4.3 `src/Task/Chat/Formatter/GLM.ts`

核心策略：**复用 `OpenAIChatCompleteBase`**（因为 `buildMessage` 和 `formatMessage` 逻辑完全一致），仅覆盖 `formatOption` 和 `formatResp`。

```typescript
import { lazyFunction, SLogger, UtilFunc } from "@zwa73/utils";

import type { GLMAPIEntry, GLMRequest } from "RequestFormat";
import type { GLMResponse } from "ResponseFormat";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ThingBudget } from "Task/DataInterface";
import { commonFormatResp } from "Task/Util";

import { OpenAIChatCompleteBase } from "./OpenAIChat";
import { commonProcessMessageWithOpt, stringifyComputeTokenCountFactory } from "./Utils";

/** GLM 推理预算映射表 */
export const GLMThinkMap = {
    non: "disabled",
    min: "enabled",
    low: "enabled",
    mid: "enabled",
    hig: "enabled",
    max: "enabled",
} as const;

/** GLM ChatTask Formatter */
export const GLMChatTaskFormatter: ChatTaskFormatter<
    GLMAPIEntry[], GLMRequest, GLMResponse
> = {
    ...OpenAIChatCompleteBase,
    async formatOption({ option, modelId }) {
        if (option.messages == null || option.messages.length == 0) {
            SLogger.warn("GLMChatOptions 无效 messages为null或长度不足");
            return;
        }

        const messages = commonProcessMessageWithOpt({
            tool: GLMChatTaskFormatter, option
        });

        const thinkType = GLMThinkMap[option.think_budget ?? "non"];

        return {
            model: modelId,
            messages,
            max_tokens: option.max_tokens,
            temperature: option.temperature,
            top_p: option.top_p,
            stop: option.stop,
            do_sample: true,
            thinking: { type: thinkType },
        } satisfies GLMRequest;
    },
    formatResp(resp) {
        if (!UtilFunc.checkSharpSchema(resp, { choices: "array" })) {
            SLogger.warn(`GLMChatTaskFormatter.formatResp 错误, resp不符合格式`, resp);
            return { choices: [], vaild: false };
        }
        const choices = resp.choices
            .filter(choice => choice?.message?.content != undefined)
            .map(choice => ({ content: choice.message.content! }));
        return { choices, vaild: choices.length > 0 };
    },
    formatResult: lazyFunction(() => commonFormatResp(GLMChatTaskFormatter)),
    computeTokenCount: lazyFunction(() =>
        stringifyComputeTokenCountFactory(GLMChatTaskFormatter)
    ),
};
```

### 4.4 注册表修改

**`src/Task/Chat/Adapter.ts`** - 新增注册项：

```typescript
import { GLMChatTaskFormatter } from "./Formatter";

export const ChatTaskFormaterTable = {
    // ...existing entries
    glm_chat: GLMChatTaskFormatter,
};
```

**`src/RequestFormat/index.ts`** - 新增导出：

```typescript
export * from './GLM';
export type AnyGLMRequest = GLMRequest;
export type AnyTextCompletionRequest = ... | AnyGLMRequest;
```

**`src/ResponseFormat/index.ts`** - 新增导出：

```typescript
export * from './GLM';
export type AnyGLMResponse = GLMResponse;
export type AnyTextCompletionResponse = ... | AnyGLMResponse;
```

## 5. 配置侧（非代码改动）

在 `data/mock/LaMService.json` 或实际配置中，添加 GLM 模型服务配置：

```json
{
    "id": "glm-4.7",
    "alias": ["glm-4.7"],
    "endpoint": "/api/paas/v4/chat/completions",
    "chat_formater": "glm_chat",
    "interactor": "openai",
    "tokensizer": "cl100k_base"
}
```

在 `data/mock/CredService.json` 或实际配置中，添加 GLM 凭证类别：

```json
{
    "cred_category": "BigModel",
    "hostname": "open.bigmodel.cn",
    "protocol": "https",
    "port": 443
}
```

## 6. 风险与注意事项

1. **`formatResp` 复用问题**: `OpenAIChatCompleteBase.formatResp` 的类型签名是 `AnyOpenAIChatLikeResponse`，GLM 响应类型不同，需要在 `GLMChatTaskFormatter` 中单独实现 `formatResp`（已在设计中覆盖）
2. **`n` 参数**: GLM 不支持 `n>1`，Formatter 中应忽略此参数
3. **`logit_bias`**: GLM 不支持，Formatter 中不应传递此参数
4. **`stop` 限制**: GLM 仅支持1个停止词，可能需要截断 `option.stop` 数组
5. **`reasoning_content`**: GLM 响应中包含推理内容，当前 `formatResp` 仅提取 `content`，`reasoning_content` 被忽略（与 Deepseek 思考内容处理方式一致）
6. **分词器**: GLM 没有官方分词器 API，建议使用 `cl100k_base` 或 `o200k_base` 作为近似估算

## 7. 工作量评估

| 步骤 | 文件数 | 复杂度 |
|------|--------|--------|
| 新增 RequestFormat | 1 | 低（复用 OpenAI 类型） |
| 新增 ResponseFormat | 1 | 低（结构类似 OpenAI） |
| 新增 Formatter | 1 | 低（复用 Base + 覆盖 formatOption） |
| 修改注册表 | 4 | 极低（加导出和注册项） |
| 配置文件 | 2 | 低（JSON 配置） |

**总计**: 3个新文件 + 4处小修改，整体工作量很小。
