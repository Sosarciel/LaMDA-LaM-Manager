---
aliases: [LaMChain 工具组抽象与调用链重构]
---
# LaMChain 工具组抽象与调用链重构

> 目标：将 LaM-Manager 的 Task/Formatter 与 Interactor 调用链重构为类型化、FP 化、非黑盒的管道工具组，使 Formatter 接管流程、支持多轮代理与工具调用，同时以高阶函数形式维持既有流程。

---

## 一、背景与动机

当前职责略显混乱，主要痛点：

1. **Formatter 与 Interactor 职责割裂**：`HttpAPIModelDrive.commonTask` 先取账号，再 `formatter.formatOption` 构造 body，然后 `interactor.postLaMRepeat` 发送，最后 `formatter.formatResult` 收尾。流程被外部 Drive 编排，Formatter 无法独立接管整个调用链，难以支撑多轮代理与工具调用（需要 Formatter 在每轮里自行决定"发什么、怎么收、要不要再发"）。
2. **Interactor 可配置但与 Formatter 分离**：`HttpApiModelCategory.interactor` 经 `InteractorTable` 选择交互器，与 formatter 解耦。新设计下每个 LaM 实例的流程应由其 Formatter 自管，需要抽出标准工具组承载"调用部分"。

## 二、已确认的两处设计问题

### p1. cred 与 source 强耦合
当前 `CredProvider` 一个对象混装两类数据：
- **source（账号类型/策略）**：`getCategoryData()` → hostname/port/protocol/proxy/retry/model_id_map/valid_model
- **cred（具体账号身份）**：name / getKey() / 计费 / 可用性

在 `commonTask` 中被当作单一整体传入交互器。需拆分为两个独立类型参数。

### p2. HttpApiModelInfo 被直接传给 request
当前 `commonTask` 将 `HttpApiModelInfo`（id/endpoint/price）直接塞入 `postLaMRepeat`，交互器内部据此拼路径、做计费。这与"Formatter 直接对原始 json 负责"冲突。应改为 **HttpApiModelInfo 作为 body 构造器（formatter 侧）的参数**，由构造器产出"就绪请求描述"（最终路径 + body），transport 工具只消费该就绪请求。

---

## 三、目标设计

### 3.1 标准工具组（抽取"调用部分"）

一组纯函数化、类型安全、非黑盒的工具，参数大致三份：

| 参数 | 语义 | 对应现物 |
|------|------|----------|
| `source` | 账号类型数据（连接策略） | 现 `CredCategory` / `AccountCategoryData` |
| `cred`   | 具体使用的账号 | 现 `CredProvider`（去掉 category 部分） |
| `json`   | 未经处理的原始 body json | 现 `postJson` / `AnyTextCompletionRequest` |

**原则**：
- 不黑盒抽象、用户可控
- 直接对原始数据操作（不做过度包装）
- 绝对严格的类型安全
- 任何 pipe 执行器（`UtilFP.flow` / 自定义 pipeline）都能套用 → 工具以 **柯里化偏应用后的一元函数** 为主体，先以 (source, cred) 构造一组工具，之后 json 在管道中一元流过

### 3.2 目标调用形态

```
pipeline(input, func1, func2)
```

其中 func1/func2 来自工具组，均为一元类型化函数。例（示意）：发请求 → 收敛重试结果。

### 3.3 原流程转为高阶函数，作为 Formatter 一部分

以与当前类似的模式挂接，保持 `TextCompletionTaskFormatter` / `ChatTaskInterface` 对外行为不变：

```
formatResult: lazyFunction(() => commonFormatResp(XxxChatTaskFormatter))
```

即：把原 `commonTask` 的取账号→构造→发送→格式化整链，包装为一个高阶函数，作为 formatter 的 `formatResult`（或驱动内部），从而**无破坏地**维持既有流程。

---

## 四、需拍板的设计张力

1. **`interactor` 配置字段去留**：新设计下 formatter 自管流程，`HttpApiModelCategory.interactor`（经 `InteractorTable`）将冗余。保留（兼容）或随重构移除？→ schema/配置决策
2. **重试/校验归属**：`postLaMRepeat` 内捆绑的 retry + verifyResp（含计费、置不可用，依赖 cred）。需抽为独立工具函数进工具组，是少数需 source+cred 并存的点。
3. **就绪请求描述的形状**：HttpApiModelInfo 进 body 构造器后，最终路径的产出位置（formatter 侧拼 path，还是 source 提供 host 由 transport 拼）需定单一责任边界。
4. **model_id_map 位置**：归 source 侧（本就在 category 数据），body 构造与路径解析统一消费。

---

## 五、实施阶段（建议顺序，每步可独立编译验证）

1. **解耦 source / cred**：拆 `CredProvider` 为 source（类别策略）与 cred（账号身份）两个类型；`getAvailableAccount` 同时返回二者。
2. **定义"就绪请求描述"**：明确 formatter 产出的最终路径 + body 的形状。
3. **抽出 transport 纯函数工具组**：source + cred + 就绪请求 → 原始响应；并抽独立 retry/verify 工具。
4. **构造器工具**：以 HttpApiModelInfo 为参，产出就绪请求。
5. **重写 commonTask 为管道高阶函数**：用工具组 pipeline 组合原链，接入 formatter（lazyFunction 模式）。
6. **多轮代理与工具调用支持**：Formatter 每轮自管发/收/再发流程。

---

## 六、兼容性与迁移

- `TextCompletionTaskFormatter` / `ChatTaskInterface` / `HttpAPIModelDrive` 对外接口保持不变，内部以新管道替换旧调用。
- 各现有 Formatter（deepseek/openai/gemini/glm 等）`formatResult: lazyFunction(()=>commonFormatResp(...))` 模式保留。
- schema 层面仅当决定移除 `interactor` 字段时才变更 `HttpApiModelCategory`。

---

## 七、参考

- 现有调用链：`src/ModelDrive/HttpApiModel/Drive.ts`（`commonTask`）
- 工具组草案：`src/LaMChain/LaMChain.ts`（含两处待修正问题）
- 格式化器基座：`src/Task/Util/Util.ts`（`commonFormatResp`）、`src/Task/ToolInterface.ts`（`TextCompletionTaskFormatter`）
- Interactor 现状：`src/Interactor/Interface.ts`、`src/Interactor/{GeminiRequester,OpenAIRequester}/PostTool.ts`
- 凭证现状：`src/CredService/Interface.ts`（`CredProvider`/`AccountCategoryData`）、`src/CredService/CredProvider.ts`

---

*起草时间: 2026-08-17*
