# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在 LaM-Manager 模块中工作时的指导规范。

## 模块概述

LaM-Manager 是 Sosarciel-LaMDA 系统的语言模型服务管理器。它负责管理多种语言模型（如 GPT、Gemini 等）的交互、凭证管理、请求代理和模拟测试。模块基于 `@zwa73/service-manager` 框架构建，采用微服务架构设计。

**核心功能**：
- **LaMService**: 语言模型服务管理，支持 HTTP API 模型和测试模型
- **CredService**: 凭证管理服务，存储和管理 API 密钥等敏感信息
- **Interactor**: 模型交互器，实现与不同模型 API 的通信（Gemini、OpenAI 等）
- **Mock**: 模拟服务器，用于开发和测试
- **ProxyPool**: 代理池管理，支持通过代理发送请求
- **Task 系统**: 任务统一处理系统，支持多种任务类型和模型格式化器（当前工作重点）

**当前工作重点**：
Task 系统是模块的核心抽象层，后续开发将重点关注以下方向：
1. **扩展任务类型**：在现有 `chat` 任务基础上，增加 `completion`（文本补全）、`edit`（文本编辑）、`embedding`（向量化）等任务类型
2. **完善格式化器**：为更多模型（Claude、文心一言、通义千问等）实现格式化器
3. **优化性能**：改进 Token 计算、缓存策略和请求批处理
4. **增强配置**：支持更细粒度的模型参数配置和动态调整
5. **测试覆盖**：为 Task 系统添加完整的单元测试和集成测试

## 开发命令

模块使用 npm workspaces 管理，以下是可用的脚本命令：

```bash
# 编译 TypeScript
npm run compile           # 全量编译 (使用 PowerShell 脚本 scripts/compile.ps1)
npm run watch             # 监听模式编译 (scripts/watch.ps1)
npm run expand-macro      # 编译前展开宏 (scripts/expand-macro.ps1)

# 构建与发布
npm run build             # 打包模块为 .tgz 文件 (scripts/pack.ps1)
npm run build-schema      # 从 TypeScript 类型生成 JSON Schema (scripts/build-schema.ps1)
npm run release           # 发布版本 (scripts/release.ps1)

# 测试
npm run test              # 运行 Jest 测试
```

**注意**：所有编译脚本均使用 PowerShell 编写，位于 `scripts/` 目录下。

## 架构说明

### 目录结构

```
src/
├── Constant.ts                  # 常量定义
├── index.ts                     # 主导出文件
├── LaMService/                  # 语言模型服务
│   ├── index.ts
│   ├── LaMInterface.ts          # 服务接口定义
│   └── LaMManager.ts            # 核心管理器
├── CredService/                 # 凭证管理
│   ├── index.ts
│   ├── CredManager.ts           # 凭证管理器
│   ├── Drive.ts                 # 数据驱动
│   ├── Interface.ts             # 接口定义
│   └── Schema.schema.ts         # 数据模式
├── Interactor/                  # 模型交互器
│   ├── index.ts
│   ├── Interface.ts             # 交互器接口
│   ├── InteractorUtil.ts        # 工具函数
│   ├── ProxyPool.ts             # 代理池
│   ├── GeminiRequester/         # Gemini 请求器
│   └── OpenAIRequester/         # OpenAI 请求器
├── Mock/                        # 模拟服务器
│   ├── index.ts
│   └── Server/                  # 模拟服务器实现
├── ModelDrive/                  # 模型数据驱动
├── RequestFormat/               # 请求格式定义
│   ├── index.ts                 # 请求格式导出
│   ├── Deepseek.ts              # DeepSeek 请求格式
│   ├── Gemini.ts                # Gemini 请求格式
│   ├── GeminiCompat.ts          # Gemini 兼容请求格式
│   ├── OpenAIChat.ts            # OpenAI 聊天请求格式
│   └── OpenAIText.ts            # OpenAI 文本请求格式
├── ResponseFormat/              # 响应格式定义
│   ├── index.ts                 # 响应格式导出
│   ├── Deepseek.ts              # DeepSeek 响应格式
│   ├── Gemini.ts                # Gemini 响应格式
│   ├── OpenAIChat.ts            # OpenAI 聊天响应格式
│   ├── OpenAIText.ts            # OpenAI 文本响应格式
│   ├── ForwardError.ts          # 转发错误格式
│   └── OpenAIError.ts           # OpenAI 错误格式
├── Task/                        # 任务系统（核心）
│   ├── index.ts                 # 任务模块导出
│   ├── DataInterface.ts         # 数据接口定义
│   ├── ToolInterface.ts         # 工具接口定义
│   ├── Chat/                    # 聊天任务
│   │   ├── index.ts             # 聊天模块导出
│   │   ├── Interface.ts         # 聊天接口定义
│   │   ├── Adapter.ts           # 聊天适配器
│   │   └── Formatter/           # 模型特定格式化器
│   │       ├── index.ts         # 格式化器导出
│   │       ├── Gemini.ts        # Gemini 格式化器
│   │       ├── OpenAIChat.ts    # OpenAI 聊天格式化器
│   │       ├── OpenAIText.ts    # OpenAI 文本格式化器
│   │       ├── Deepseek.ts      # DeepSeek 聊天格式化器
│   │       ├── DeepseekBeta.ts  # DeepSeek Beta 格式化器
│   │       ├── DeepseekText.ts  # DeepSeek 文本格式化器
│   │       ├── GeminiCompat.ts  # Gemini 兼容格式化器
│   │       └── Utils.ts         # 格式化工具函数
│   └── Util/                    # 任务工具函数
│       ├── index.ts             # 工具导出
│       └── Util.ts              # 通用工具函数
└── Tokensizer/                  # Token 编码器
    ├── index.ts                 # 编码器导出
    └── Tokensizer.ts            # 编码器实现

data/                           # 配置文件
├── mock/                       # 模拟数据
└── tokensizer/                 # Tokenizer 数据

schema/                         # JSON Schema 文件
├── APIPrice.schema.json
├── CredCategoryJsonTable.schema.json
├── CredServiceJsonTable.schema.json
├── HttpApiModelCategory.schema.json
├── LaMServiceJsonTable.schema.json
└── schemas.json                # 合并的 Schema 文件

build/                          # 构建输出
dist/                           # 编译输出
release/                        # 发布文件
```

### 核心组件

1. **LaMManager**
   - 基于 `@zwa73/service-manager` 的服务管理器
   - 管理多个模型实例，每个实例可配置不同的驱动（如 HttpAPIModel、Test）
   - 提供统一的接口调用、Token 编码和默认选项获取

2. **CredManager**
   - 凭证数据管理，支持分类存储
   - 提供安全的凭证存取接口
   - 数据持久化到 JSON 文件

3. **Interactor**
   - 封装不同模型 API 的通信细节
   - 支持代理轮询（ProxyPool）
   - 提供统一的请求格式和错误处理

4. **Mock Server**
   - 用于开发和测试的模拟服务器
   - 模拟 Gemini 和 OpenAI 等模型的响应
   - 支持配置不同的模型行为

5. **Task 系统（核心工作重点）**
   - **模块定位**: 任务系统的核心，负责统一处理不同类型的语言模型任务
   - **任务类型**: 目前支持 `chat`（聊天）任务，可扩展其他任务类型（如补全、编辑等）
   - **核心接口**:
     - `TaskInterface`: 定义所有任务类型的接口
     - `TextCompletionInterface`: 文本完成通用接口（Token编码、解码、默认选项）
     - `ChatTaskInterface`: 聊天任务专用接口
   - **格式化器系统**:
     - `ChatTaskFormatter`: 聊天任务格式化器抽象，支持不同模型的请求/响应格式转换
     - **支持的模型**: `deepseek_chat`, `deepseek_chat_beta`, `deepseek_text`, `openai_chat`, `openai_text`, `google_chat`, `google_chat_compat`
     - **核心功能**:
       - `formatOption`: 将通用配置转换为模型特定请求格式
       - `formatResult`: 将模型响应转换为通用结果格式
       - `buildMessage`: 构建模型特定的消息格式
       - `formatMessage`: 格式化消息以稳定模型输出
       - `computeTokenCount`: 计算消息的 Token 数量
   - **数据接口**:
     - `TextCompletionOption`: 文本完成通用配置（温度、top_p、停止词等）
     - `TextCompletionResp`: 文本完成通用响应
     - `ChatTaskOption`: 聊天任务配置（消息历史、目标角色、提示等）
     - `LaMChatMessages`: 通用聊天消息格式（角色消息、系统消息）

### 数据流

```
外部请求 → LaMManager → 选择模型实例 → Task 系统 → Interactor → 模型 API
      │               │               │                        │
      │               │               ├─ 任务类型选择 (chat)   │
      │               │               ├─ 格式化器选择          │
      │               │               ├─ 消息构建/转换         │
      │               │               └─ 结果格式化            │
      ↓               ↓               ↓                        ↓
   CredManager    ProxyPool       Token计算                  代理配置
      ↓               ↓               ↓                        ↓
   凭证数据        代理配置      配置验证/转换              实际请求
```

## 配置管理

### 配置文件

- 模块配置通过 JSON 文件管理，位于 `data/` 目录
- Schema 定义位于 `schema/` 目录，用于验证配置格式
- 主要配置文件：
  - `LaMServiceJsonTable`: 服务实例配置
  - `CredServiceJsonTable`: 凭证服务配置
  - `HttpApiModelCategory`: HTTP API 模型分类

### 路径别名

TypeScript 配置中定义了以下路径别名（见 `tsconfig.json`）：

- `@`: `./src/index`
- `@/src/*`: `./src/*`
- `LaMService`, `CredService`, `Interactor`, `Mock`: 对应模块目录
- `Constant`, `ResponseFormat`, `RequestFormat`, `Task`, `Tokensizer`: 核心文件

## 代码质量与标准

### ESLint

- 配置文件：`eslint.config.js`
- 使用 `@typescript-eslint` 规则集
- 启用严格模式，限制特定导入模式以防止循环依赖

### TypeScript

- 启用严格模式 (`strict: true`)
- 目标版本：ES2022
- 模块系统：Node16
- 生成声明文件 (`declaration: true`)

### 导入规范

- 使用路径别名代替相对路径
- 禁止跨模块的直接导入（通过接口抽象）
- 组导入之间用空行分隔

## 开发工作流

### 1. 本地开发

```bash
# 进入模块目录
cd F:\Sosarciel\Sosarciel-LaMDA\LaMDA-Module\Service-Manager\LaM-Manager

# 监听模式编译
npm run watch

# 在另一个终端运行测试
npm run test
```

### 2. 修改代码

- 添加新模型交互器：在 `src/Interactor/` 下创建新的请求器目录
- 添加新凭证类型：扩展 `src/CredService/Interface.ts`
- 修改服务配置：更新对应的 Schema 文件和数据类型

### 3. 构建与发布

```bash
# 构建模块包
npm run build

# 生成 Schema 文件
npm run build-schema

# 发布新版本（需要权限）
npm run release
```

### 4. 测试

- 测试文件位于 `jest/` 目录
- 使用 Jest 测试框架
- 模拟数据位于 `data/mock/`

## Claude Code 注意事项

- **模块独立性**: LaM-Manager 是一个独立的 npm 包，通过 `.tgz` 文件供主服务器使用
- **配置驱动**: 所有服务实例通过 JSON 配置动态创建，无需修改代码
- **凭证安全**: 凭证数据存储在 `data/` 目录，应避免提交敏感信息到版本控制
- **代理支持**: 通过 `ProxyPool` 支持代理轮询，适合需要翻墙的环境
- **模拟开发**: 使用 Mock 服务器可在无真实 API 密钥的情况下进行开发
- **TypeScript 严格模式**: 代码必须通过严格类型检查
- **始终使用中文回复用户提问**

## 常见任务

### 添加新模型支持

1. 在 `src/Interactor/` 下创建新的请求器目录
2. 实现请求接口（参考 `GeminiRequester` 或 `OpenAIRequester`）
3. 在 `src/LaMService/LaMInterface.ts` 中扩展驱动类型
4. 更新 Schema 文件以支持新配置
5. 添加测试用例

### 修改凭证管理

1. 更新 `src/CredService/Interface.ts` 中的类型定义
2. 修改 `src/CredService/CredManager.ts` 的业务逻辑
3. 更新 `src/CredService/Schema.schema.ts` 中的 Schema 定义
4. 运行 `npm run build-schema` 生成新的 JSON Schema

### 调试请求问题

1. 启用 Mock 服务器进行本地测试
2. 检查 ProxyPool 配置是否正确
3. 查看 CredManager 中的凭证数据
4. 使用 InteractorUtil 中的调试工具

### 扩展 Task 系统

#### 添加新任务类型
1. 在 `src/Task/DataInterface.ts` 中定义新的任务类型，添加到 `TaskTypeList` 和 `TaskInterface`
2. 创建任务专用目录（如 `src/Task/Completion/`），包含接口、格式化器等
3. 实现任务特定的 `Formatter` 和 `Adapter`
4. 在 `src/Task/index.ts` 中导出新任务模块
5. 更新相关 Schema 文件并运行 `npm run build-schema`

#### 添加新模型格式化器
1. 在 `src/Task/Chat/Formatter/` 下创建新的格式化器文件（如 `Claude.ts`）
2. 实现 `ChatTaskFormatter` 接口的所有方法：
   - `formatOption`: 配置转换
   - `formatResult`: 结果转换
   - `buildMessage`: 消息构建
   - `formatMessage`: 消息格式化
   - `computeTokenCount`: Token 计算
   - `formatResp`: 响应包装
3. 在 `src/Task/Chat/Adapter.ts` 的 `ChatTaskFormaterTable` 中注册新格式化器
4. 在 `src/Task/Chat/Formatter/index.ts` 中导出新格式化器
5. 添加对应的请求器（`src/Interactor/`）和响应格式定义

#### 优化现有格式化器
1. 检查 `think_budget` 参数处理（参考 `Gemini.ts` 中的 `GeminiThinkMap`）
2. 优化消息处理逻辑（角色转换、系统提示合并等）
3. 改进 Token 计算精度和性能
4. 添加详细的日志记录和错误处理

#### 测试 Task 系统
1. 为每个格式化器编写单元测试（`jest/Task/Chat/Formatter/`）
2. 测试不同配置组合的兼容性
3. 验证 Token 计算的准确性
4. 测试边界条件和错误场景

---

*最后更新：2026-03-07*