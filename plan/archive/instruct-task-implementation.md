# Instruct Task 实施计划

## 1. 项目背景与目标

### 背景
当前 Task 系统仅支持 `chat` 任务，但实际应用中需要纯文本生成任务，避免聊天端点带来的自我意识和厂商注入的无用提示。

### 目标
添加 `instruct` 任务类型，支持传统 API 的纯文本生成，专注于：
- 模板填充
- 代码补全
- 文本续写
- 填空补全（FIM, Fill-in-the-Middle）

### 设计原则
- 保持与现有 Task 系统架构一致
- 最小化 chat-specific 特性，专注于文本补全
- 支持多种传统 API 模式
- 可扩展性：未来支持更多传统模型

## 2. 核心设计

### 2.1 任务类型定义
- **新增任务类型**: `instruct`（指导式文本生成）
- **与 chat 任务的区别**:
  - 无消息历史（`messages`）
  - 无角色对话逻辑
  - 无系统提示自动注入
  - 支持 FIM（填充中间）模式

### 2.2 支持的模式
1. **OpenAI Instruct**: `gpt-3.5-turbo-instruct` 等传统补全端点
2. **DeepSeek FIM**: DeepSeek 的填充中间模式
3. **通用前缀续写**: 适配多种支持前缀续写的 API

### 2.3 接口设计

#### InstructTaskOption（扩展 `TextCompletionOption`）
```typescript
type InstructTaskOption = TextCompletionOption & {
  /** 主要提示文本（必需） */
  prompt: string;

  /** FIM 模式：后缀文本 */
  suffix?: string;

  /** 停止词列表 */
  stop?: string[];

  /** 是否返回 logprobs。
   * 传统 Instruct/Completion 任务常用于代码评估，此字段很有用。
   */
  logprobs?: number;

  /** 是否在返回结果中包含原始 prompt */
  echo?: boolean;
};
```

#### InstructTaskInterface
```typescript
type InstructTaskInterface = {
  /** 计算提示文本的 Token 数量 */
  computeTokenCount(prompt: string): Promise<number>;

  /** 执行指导式文本生成 */
  execute(opt: InstructTaskOption): Promise<TextCompletionResult>;
};
```

## 3. 架构扩展

### 3.1 目录结构
```
src/Task/
├── DataInterface.ts              # 扩展 TaskTypeList 和 TaskInterface
├── ToolInterface.ts              # 新增 InstructTaskFormatter 类型
├── Instruct/                     # 新增目录
│   ├── index.ts                  # 导出 Instruct 模块
│   ├── Interface.ts              # 定义 InstructTaskInterface
│   ├── Adapter.ts                # InstructTaskFormatter 和注册表
│   └── Formatter/                # 模型特定格式化器
│       ├── index.ts              # 格式化器导出
│       ├── OpenAIInstruct.ts     # OpenAI Instruct 格式化器
│       ├── DeepseekFIM.ts        # DeepSeek FIM 格式化器
│       ├── PrefixCompletion.ts   # 通用前缀续写格式化器
│       └── Utils.ts              # 工具函数
└── Chat/                         # 现有 Chat 任务（保持不变）
```

### 3.2 格式化器设计

#### InstructTaskFormatter 接口（类似 `ChatTaskFormatter`，但简化）
```typescript
type InstructTaskFormatter<
  REQ extends AnyTextCompletionRequest,
  RES extends AnyTextCompletionResponse
> = TextCompletionTaskFormatter<InstructTaskOption, REQ, RES> & {
  /** 构建模型特定的提示格式 */
  buildPrompt(opt: InstructTaskOption): string;

  /** 计算 Token 数量 */
  computeTokenCount(prompt: string, tokensizerType: TokensizerType): Promise<number>;

  /** 响应包装器 */
  formatResp(resp: RES): TextCompletionResp;
};
```

## 4. 实现步骤

### 阶段一：核心接口扩展 (2-3天)
1. **扩展 Task 类型定义** (`src/Task/DataInterface.ts`)
   - 添加 `'instruct'` 到 `TaskTypeList`
   - 扩展 `TaskInterface` 包含 `instruct: InstructTaskInterface`
   - 定义 `InstructTaskOption` 类型

2. **创建 Instruct 模块骨架** (`src/Task/Instruct/`)
   - 创建目录结构
   - 定义 `InstructTaskInterface`
   - 定义 `InstructTaskFormatter` 类型

### 阶段二：格式化器实现 (3-4天)
3. **实现 OpenAI Instruct 格式化器**
   - 适配 `gpt-3.5-turbo-instruct` 端点
   - 请求格式：`{ prompt: string, ...options }`
   - 响应处理：提取 `choices[0].text`

4. **实现 DeepSeek FIM 格式化器**
   - 适配 DeepSeek 的 FIM 模式 与 gpt-3.5-turbo-instruct 等价, 但要单独写一个文件以供可能的扩展
   - DeepSeek / OpenAI FIM 请求体样例
REST API 请求示例 (POST)
Endpoint: https://api.deepseek.com/beta/completions (或兼容 OpenAI 的 /v1/completions)
```
{
  "model": "deepseek-chat",
  "prompt": "def calculate_area(radius):\n    import math\n   ",
  "suffix": "\n    return area",
  "max_tokens": 64,
  "temperature": 0,
  "top_p": 1,
  "n": 1,
  "stream": false,
  "stop": ["\n\n", "def "],
  "logprobs": null
}
```

5. **实现通用前缀续写格式化器**
   - 适配多种支持前缀续写的 API
   - 提供配置映射机制

### 阶段三：集成与测试 (2-3天)
6. **更新请求/响应格式**（如需要）
   - 在 `RequestFormat/` 和 `ResponseFormat/` 中添加新类型
   - 确保类型安全

7. **扩展交互器** (`src/Interactor/`)
   - 扩展现有请求器或创建新请求器
   - 支持 instruct 端点的调用

8. **集成到 LaMManager**
   - 更新服务配置支持 instruct 任务
   - 确保向后兼容性

9. **测试覆盖**
   - 单元测试：每个格式化器
   - 集成测试：端到端流程
   - 兼容性测试：不同模型和配置

## 5. 技术挑战与解决方案

### 挑战 1: FIM 模式标准化
- **问题**: 不同 API 的 FIM 格式不同（特殊 token、位置标记等）
- **解决方案**:
  - 抽象通用 FIM 接口：`{ prompt, suffix }`
  - 对于前缀续写模式直接忽略suffix, 并给出警告
  - 在格式化器内进行 API 特定转换
  - 提供配置映射表

### 挑战 2: 模型兼容性
- **问题**: 并非所有模型都支持 instruct 或 FIM 模式
- **解决方案**:
  - 不对这些模型支持

### 挑战 3: Token 计算差异
- **问题**: FIM 模式的 Token 计算复杂
- **解决方案**:
  - 使用模型特定的 Tokenizer
  - 提供估算函数和精确计算选项
  - 缓存计算结果

## 6. 测试策略

### 单元测试
- **格式化器测试**: 每个格式化器的 `buildPrompt`、`formatOption`、`formatResp`
- **边界测试**: 空提示、超长文本、特殊字符
- **错误测试**: 无效配置、模型不支持

### 集成测试
- **端到端流程**: 从 LaMManager 到实际 API 调用
- **Mock 测试**: 使用 Mock 服务器验证请求格式
- **性能测试**: Token 计算性能、并发处理

### 兼容性测试矩阵
| 模型                | 模式           | 测试用例                     |
|---------------------|----------------|----------------------------|
| gpt-3.5-turbo-instruct | OpenAI Instruct | 简单提示、带停止词、长文本 |
| deepseek-chat       | DeepSeek FIM   | 前缀+后缀、仅前缀、仅后缀  |
| 通用模型            | 前缀续写       | 不同停止词、温度参数       |

## 7. 后续扩展方向

1. **更多模型支持**
   - Claude 的 instruct 模式
   - 文心一言、通义千问等国内模型
   - 本地模型（Llama、Qwen 等）

2. **高级功能**
   - 批量处理：同时生成多个补全
   - 流式输出：支持 SSE 流式响应
   - 缓存机制：相同提示的结果缓存

3. **工具集成**
   - 与模板引擎集成：支持变量替换
   - 代码补全专用格式化器：语言特定优化
   - 质量评估：生成结果的自动评分

## 8. 风险评估

- **API 变动风险**: 厂商可能更改传统端点
  - 缓解：抽象层隔离，快速适配能力
- **性能开销**: FIM 模式可能增加计算复杂度
  - 缓解：优化 Token 计算，添加缓存
- **维护成本**: 支持多种模式增加维护负担
  - 缓解：清晰的分层设计，自动化测试

## 9. 交付物

1. **代码实现**: 完整的 `instruct` 任务模块
2. **文档**: 使用指南、API 文档
3. **测试套件**: 单元测试和集成测试
4. **示例配置**: 各种模式的配置示例
5. **性能报告**: Token 计算和请求性能数据

---

**预计总时长**: 7-10 个工作日
**优先级**: 高（填补 Task 系统关键功能空白）
**依赖**: 现有 Task 系统架构稳定，无外部依赖

**创建时间**: 2026-03-07
**负责人**: Claude Code
**状态**: 待开始