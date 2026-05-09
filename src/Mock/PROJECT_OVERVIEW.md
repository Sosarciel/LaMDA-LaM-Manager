# LaM-Manager Mock 系统概述

## 🏗️ 项目架构

### 核心模块结构
```
LaM-Manager/
├── src/
│   ├── Mock/                    # Mock 系统
│   │   ├── Server/             # Mock 服务器
│   │   │   ├── OpenAIRequester/ # OpenAI 格式处理器
│   │   │   └── GeminiRequester/ # Gemini 格式处理器
│   │   ├── Utils.ts            # Mock 工具函数和配置
│   │   └── Test/               # Mock 测试
│   ├── Interactor/             # 真实 API 交互器
│   │   ├── OpenAIRequester/    # OpenAI 交互器
│   │   └── GeminiRequester/    # Gemini 交互器
│   ├── RequestFormat/          # 请求格式定义
│   ├── ResponseFormat/         # 响应格式定义
│   └── Task/Chat/Formatter/    # 聊天格式化器
└── data/
    └── mock/                   # Mock 数据
```

### Mock 服务器设计
`MockServer.ts` 是核心 Mock 服务器，处理不同 API 格式的请求：
- **OpenAI 格式**: `/v1/chat/completions`, `/v1/completions`
- **Gemini 格式**: `/v1beta/models/{model_id}:generateContent`

## 🔌 API 格式差异

### OpenAI 兼容格式
- **模型指定方式**: 请求体中的 `model` 字段
- **示例请求**:
  ```json
  {
    "model": "gpt-3.5-turbo",
    "messages": [...]
  }
  ```
- **路由路径**: `/v1/chat/completions` (统一路径)
- **处理器**: `procOpenAIChat(data)` 根据 `data.model` 分发

### Gemini 原生格式
- **模型指定方式**: URL 路径中的模型 ID
- **示例路径**: `/v1beta/models/gemini-3-pro-preview:generateContent`
- **提取逻辑**:
  ```typescript
  const geminiMatch = path.match(/^\/v1beta\/models\/([^\/:]+)(?::generateContent)?/);
  const modelId = geminiMatch[1]; // "gemini-3-pro-preview"
  ```
- **处理器**: `procGemini(modelId, data)` 接收模型 ID 作为参数

## 🧪 Mock 配置系统

### 配置文件位置
- **真实配置**: `server/data/LaMService.json`
- **Mock 配置**: `src/Mock/Utils.ts` 中的 `MOCK_LAM_SERVICE_TABLE`

### 配置关键字段
```typescript
{
  instance_table: {
    "Gemini3Pro": {
      name: "Gemini3Pro",
      type: "HttpAPIModel",
      data: {
        config: {
          tokensizer: "cl100k_base",
          interactor: "gemini",        // 关键：交互器类型
          chat_formatter: "google_chat", // 关键：格式器类型
          endpoint: "/v1beta/models",   // 关键：API 端点
          id: "gemini-3-pro-preview",   // 关键：模型 ID
          alias: "Gemini3Pro",
          price: {...}
        },
        default_option: {
          temperature: 1,
          max_hist: 4000,
          think_budget: "min"
        }
      }
    }
  }
}
```

### 配置匹配规则
1. **交互器 (interactor)**:
   - `"openai"` → 使用 OpenAIRequester
   - `"gemini"` → 使用 GeminiRequester
2. **端点 (endpoint)**:
   - `/v1/chat/completions` → OpenAI 格式路由
   - `/v1beta/models` → Gemini 格式路由
3. **格式器 (chat_formatter)**:
   - `"openai_chat"` → OpenAI 聊天格式
   - `"google_chat"` → Google/Gemini 原生格式
   - `"google_chat_compat"` → Google OpenAI 兼容格式

## 🛠️ Mock 处理器设计

### OpenAI 处理器链
```
procOpenAIChat(data)
  ├── match(data.model)
  │   ├── 'gpt-3.5-turbo' → procGPT35Chat
  │   ├── 'gpt-3.5-turbo-instruct' → procGPT35Text
  │   └── 'deepseek-chat' → procDeepseekChat
  └── 返回 OpenAIChatResponse
```

### Gemini 处理器链
```
procGemini(modelId, data)
  ├── match(modelId)
  │   └── 'gemini-3-pro-preview' → procGemini3Pro
  └── 返回 GeminiResponse
```

### 响应构建模式
所有 Mock 处理器都使用 `LaMManagerMockTool.buildResp()`：
```typescript
LaMManagerMockTool.buildResp('Gemini3Pro', msg)
// 返回: "来自 Gemini3Pro 对 你好 的响应"
```

## 🧪 测试系统集成

### 测试目录结构
```
Test/
├── src/
│   ├── LaM-Manager/
│   │   └── index.test.ts       # 主测试文件
│   └── setup.ts               # 测试设置
└── jest.config.js
```

### 测试初始化流程
1. **创建 Mock 配置文件**:
   ```typescript
   await UtilFT.writeJSONFile(LaMServiceTablePath, LaMManagerMockTool.MOCK_LAM_SERVICE_TABLE);
   ```
2. **初始化管理器**:
   ```typescript
   LaMManager.initInject({ serviceTable: LaMServiceTablePath });
   CredManager.initInject({...});
   ```
3. **执行测试对话**:
   ```typescript
   const result = await LaMManager.chat.execute("Gemini3Pro", {...});
   ```

### 测试断言
验证 Mock 响应格式正确：
```typescript
expect(result.completed?.choices?.[0].content)
  .toBe(LaMManagerMockTool.buildResp('Gemini3Pro', "你好"));
```

## 🔧 常见问题和解决方案

### 1. Mock 服务器路由错误
**问题**: 路由不匹配或 404 错误
**解决**:
- 检查 `MockServer.ts` 中的路径匹配逻辑
- 确认请求路径包含正确的端点前缀
- 验证正则表达式是否正确提取模型 ID

### 2. 模型配置不匹配
**问题**: Mock 配置与真实配置不一致
**解决**:
- 对比 `src/Mock/Utils.ts` 和 `server/data/LaMService.json`
- 确保关键字段一致：`interactor`, `endpoint`, `chat_formatter`, `id`

### 3. 类型转换错误
**问题**: TypeScript 类型断言错误
**解决**:
- 使用 `satisfies` 关键字确保类型正确
  ```typescript
  return {...} satisfies GeminiResponse;
  ```
- 检查 `RequestFormat/` 和 `ResponseFormat/` 中的类型定义

### 4. 新模型添加流程
1. **在真实配置中添加**: `server/data/LaMService.json`
2. **在 Mock 配置中添加**: `src/Mock/Utils.ts` (MOCK_LAM_SERVICE_TABLE)
3. **创建处理器**: `src/Mock/Server/{ApiType}Requester/`
4. **注册处理器**: 在对应 `index.ts` 中添加 match 分支
5. **添加测试**: `Test/src/LaM-Manager/index.test.ts`

## 📚 关键文件索引

| 文件路径 | 用途 | 关键内容 |
|---------|------|---------|
| `src/Mock/Utils.ts` | Mock 配置和工具 | `MOCK_LAM_SERVICE_TABLE`, `buildResp()` |
| `src/Mock/Server/MockServer.ts` | Mock 服务器 | 路由分发，路径解析 |
| `src/Mock/Server/OpenAIRequester/` | OpenAI 处理器 | `procOpenAIChat()`, 各模型处理器 |
| `src/Mock/Server/GeminiRequester/` | Gemini 处理器 | `procGemini()`, `procGemini3Pro()` |
| `server/data/LaMService.json` | 真实配置 | 所有模型的实际配置 |
| `Test/src/LaM-Manager/index.test.ts` | 测试用例 | 对话测试，断言验证 |

## 💡 设计模式总结

### 1. **配置驱动设计**
Mock 系统完全基于配置运行，确保与真实系统行为一致。

### 2. **协议分离**
不同 API 协议（OpenAI vs Gemini）使用独立的处理器链，避免逻辑混杂。

### 3. **路径解析优先**
API 协议识别基于 URL 路径而非请求体，符合实际 API 设计。

### 4. **类型安全**
使用 TypeScript `satisfies` 和严格类型定义，减少运行时错误。

### 5. **统一响应构建**
所有 Mock 处理器使用相同的 `buildResp()` 工具，保持一致性。

---

**最后更新**: 2026-03-05
**创建目的**: 减少后续对话中的重复分析，提供快速参考
**适用场景**: LaM-Manager Mock 系统开发、测试编写、问题排查