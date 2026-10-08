---
aliases: [CredCategory host/protocol/port 合并为 url]
---
# CredCategory 连接字段合并为单 url

> 目标：将 `AccountCategoryData` 的 `hostname` + `port` + `protocol` 三个字段合并为单个 `url` 字段，去掉 `SourceProvider` 与 `UtilHttp` 之间的冗余覆盖路径，使配置更直观、职责更单一。

---

## 一、背景与动机

### 1.1 现状

凭证类别配置（`server/data/CredCategory.json`）中，连接信息被拆成三个字段：

```jsonc
{
    "id": "Eylink5",
    "hostname": "api.yesapikey.com",   // 必填
    "port": 4000,                       // 必填
    "protocol": "http",                 // 可选, 默认 https
    "proxy_url": "http://127.0.0.1:7890"
}
```

schema 的 `required` 为 `["hostname", "id", "port"]`，`protocol` 是 `enum: ["http","https"]` 的可选字段。

### 1.2 动机

**① 三字段本就是同一个 URL 的组成部分。** authority 的定义即 `host[:port]`，加上 scheme 就是一个完整 origin。拆开书写会丢失「这三者是一个整体」的语义。

**② 同 host 不同端口的类别极易看串行。** 现有配置里存在这样的对照：

| 类别 | hostname | port | protocol |
|---|---|---|---|
| `Eylink4` | `api.yesapikey.com` | 443 | `https` |
| `Eylink5` | `api.yesapikey.com` | 4000 | `http` |
| `EylinkGimini` | `api.yesapikey.com` | 4000 | `http` |

三条记录中 `Eylink5` 与 `EylinkAz` 之外的差异只在数字上，书写时缺乏视觉区分度。改成 url 后：

```
"https://api.yesapikey.com"
"http://api.yesapikey.com:4000"
"http://api.yesapikey.com:4000"
```

**③ 传输层存在冗余覆盖路径（核心动机）。** `UtilHttp.url()` 已经从 URL 中解析出 `hostname` / `port`，但 `PostTool` 紧接着又用 `.option()` 覆盖一遍同样的值。

### 1.3 需要澄清的一点

本次改造是**整洁度重构**，不是缺陷修复。当前实现没有错误：

- `source.protocol` 与 `RequestOption.protocol` 只是恰好同名，分属两个域。前者仅作字符串插值参与 `` `${protocol}://${hostname}` `` 拼接，**从未被赋值给后者**；带冒号的形式由 `new URL()` 自行产出。两者之间不存在类型不匹配的赋值点。
- 配置值由 schema（TS 直出）在源头约束，非法值不会进入运行时。

因此本文档定位为**结构收敛**，不主张修复任何现存 bug。

---

## 二、现状调用链

### 2.1 数据流

```
CredCategory.json  (hostname / port / protocol)
        │
        ▼
AccountCategoryData                     CredService/Interface.ts:49
        │
        ▼
wrapperAccountManager()                 CredService/CredProvider.ts:18
        │  平铺 cateData 四个字段
        ▼
SourceProvider { hostname, port?, protocol? }    LaM-Chain/LaMChain/Interface.ts:45
        │
        ▼
OpenAiPostTool.postLaM()                Interactor/OpenAIRequester/PostTool.ts:27
GeminiPostTool.postLaM()                Interactor/GeminiRequester/PostTool.ts:24
```

### 2.2 冗余点

两个 PostTool 中，连接信息的消费方式如下（以 OpenAI 为例）：

```ts
const protocol = source.protocol ?? 'https';
const port = source.port ?? (protocol === 'https' ? 443 : 80);

const respData = await UtilHttp.url(`${protocol}://${source.hostname}`)  // ← 解析出 hostname/port/protocol
    .postJson().option({
        hostname: source.hostname,   // ← 与上一行解析结果相同
        port,                        // ← 与上一行解析结果相同
        path: modelData.endpoint,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cred.key}` },
        dispatcher: source.proxyUrl ? getProxy(source.proxyUrl) : undefined,
        timeout: timeLimit,
    }).once({ json: postJson });
```

`UtilHttp.url()` 的实现（`utils/src/UtilHttp.ts:149`）：

```ts
static url(urlStr: `${'http:' | 'https:'}//${string}`) {
    const { protocol, hostname, port, pathname } = new URL(urlStr);
    if (!['http:', 'https:'].includes(protocol))
        UtilFunc.throwError(`url协议错误: ${urlStr}`);
    const req = new UtilHttp({ protocol: protocol as 'http:' | 'https:' }, SendNoneProc, AcceptStringProc);
    return req.option({
        hostname,                          // ← 已解析
        path: pathname,
        port: port ? parseInt(port) : undefined,   // ← 已解析
    });
}
```

即：**先拆成三字段 → 拼回完整 URL → 再被 `new URL()` 拆开 → 又用 `.option()` 覆盖一遍**。`protocol` 局部变量的全部作用只是参与那一次字符串拼接。

### 2.3 port 的归属

`source.port` 在真实路径中是必填（schema `required` 含 `port`，16 个类别全部显式填写），因此 `` source.port ?? (protocol === 'https' ? 443 : 80) `` 的兜底分支在当前配置下不会触发。URL 形式下端口天然归属 authority，这个三元兜底可以整体删除。

---

## 三、目标设计

### 3.1 配置形态

```jsonc
// 之后
{
    "id": "Eylink5",
    "url": "http://api.yesapikey.com:4000",
    "model_id_map": { /* ... */ },
    "valid_model": [ /* ... */ ]
}
```

schema `required` 从 `["hostname", "id", "port"]` 收敛为 `["id", "url"]`；`protocol` 枚举字段随之删除。

### 3.2 url 的语义边界：**只承载 origin，不含路径**

这条必须定死。理由是两个字段**维度不同**：

| 字段 | 所属 | 配置文件 |
|---|---|---|
| `url` | 凭证类别（谁提供） | `CredCategory.json` |
| `endpoint` | 模型实例（调什么） | `LaMService.json` |

同一个 `Deepseek` 类别被多个实例共用，各自 `endpoint` 不同：

| 实例 | endpoint |
|---|---|
| `default` | `/beta/v1/chat/completions` |
| `DeepseekFlash` | `/v1/chat/completions` |
| `DeepseekFlashText` | `/beta/v1/completions` |
| `DeepseekProRaw` | `/v1/chat/completions` |

把 endpoint 并入 url 会把两个配置文件的职责搅在一起。

**并且这里有一个实际的坑**：`UtilHttp.url()` 会把 URL 的 `pathname` 写入 `path`，但 PostTool 紧接着 `.option({ path: modelData.endpoint })` 将其**覆盖**。也就是说 url 里即便写了路径也会被静默丢弃——若未来确需支持前缀路径，必须显式拼接（如 `path: source.urlPrefix + modelData.endpoint`），不能依赖 `UtilHttp.url` 的自动解析。

### 3.3 分层改造方案

改造可分两层推进，**配置面可独立成立**：

| | 改动内容 | 影响范围 | 是否需发版 |
|---|---|---|---|
| **配置面** | `AccountCategoryData.url` 取代 hostname/port/protocol；`wrapperAccountManager` 内 `new URL()` 拆回现有 `SourceProvider` | 仅 LaM-Manager | 否（LaM-Chain 不动） |
| **传输面** | `SourceProvider.url` 取代三字段；两个 PostTool 删除冗余覆盖 | LaM-Chain + LaM-Manager + server | 是 |

配置面单独做即可获得「配置直观、required 更少」的全部收益；传输面额外获得「删除冗余覆盖、消除 protocol/port 局部变量」。

### 3.4 各文件详细设计

#### A. 配置面（LaM-Manager）

**`src/CredService/Interface.ts`** — `AccountCategoryData` 字段变更：

```ts
/**账户类型数据 */
export type AccountCategoryData = {
    /**此账户类型的id */
    id:CredCategoryID;
    /**此类别的服务地址 仅含 origin (scheme://host[:port])
     * 不含路径, 路径由模型实例的 endpoint 提供
     */
    url:ServiceUrl;
    /**是否使用代理 */
    proxy_url?:string;
    /**重试设定 PromiseRetries */
    retry?:SnackRetry;
    /**modelid 映射
     * 用于处理类似SiliconFlow的模型id不一致问题
     */
    model_id_map?:Record<string,string>;
    /**支持的模型
     * name 为别名 * 为所有模型
     * weight 为优先度, 优先使用高优先度的有效账号 单字符串时为1
     */
    valid_model?:(string|{name:string,weight:number})[];
}
```

`ServiceUrl` 类型别名建议直接对齐 `UtilHttp.url()` 的入参签名，既过类型检查又自带文档性：

```ts
/**服务地址 仅含 origin 不含路径 */
export type ServiceUrl = `${'http:' | 'https:'}//${string}`;
```

**`src/CredService/CredProvider.ts`** — `wrapperAccountManager` 内做一次解析。若选配置面独立方案，此处 `new URL()` 拆回现有 `SourceProvider` 三字段：

```ts
const cateData = await CredManager.getCategoryData(instance.getData().cred_category);
const parsed = new URL(cateData.url);
return {
    source:{
        name:cateData.id,
        hostname:parsed.hostname,
        protocol:parsed.protocol.replace(':','') as 'http'|'https',
        port:parsed.port ? Number(parsed.port) : undefined,
        proxyUrl:cateData.proxy_url,
        modelIdMap:cateData.model_id_map,
        retry:UtilFunc.snakeToCamel(cateData.retry),
    } satisfies SourceProvider,
    cred:{ /* 不变 */ },
};
```

若选一次做到底，此处直接 `url:cateData.url` 透传即可，无需解析。

**`data/mock/` 与测试** — `LaMManagerMockTool.getMockCredCategoryTable()`（`src/Mock/Utils.ts:24`）需要同步改造：

```ts
export const getMockCredCategoryTable = (port: number) => ({
    category_table: {
        MockCredCategory: {
            id: MOCK_CRED_CATEGORY,
            url: `http://localhost:${port}`,
            valid_model:["*"],
        },
    },
} as const satisfies CredCategoryJsonTable);
```

#### B. 传输面（LaM-Chain）

**`src/LaMChain/Interface.ts`** — `SourceProvider` 字段变更：

```ts
/**源提供者 */
export type SourceProvider = {
    /**名称 */
    name?:string;
    /**服务地址 仅含 origin (scheme://host[:port]) 不含路径 */
    url:ServiceUrl;
    /**是否使用代理 */
    proxyUrl?:string;
    /**重试设定 PromiseRetryOption */
    retry?:PromiseRetryOption;
    /**modelid 映射
     * 用于处理类似SiliconFlow的模型id不一致问题
     */
    modelIdMap?:Record<string,string>;
}
```

**`src/Interactor/OpenAIRequester/PostTool.ts`** — 删除 protocol/port 局部变量与冗余覆盖：

```ts
async postLaM(partialOpt:PresetOption<typeof PostLaMOptionPreset>){
    const opt = PostLaMOptionPreset.assign(partialOpt);
    const {cred,source,modelData,timeLimit} = opt;
    const postJson = LaMChain.specializeOpenAILikeRequest({
        json:opt.postJson as AnyOpenAILikeRequest,
        source,
    });

    const respData = await UtilHttp.url(source.url)
        .postJson().option({
            path: modelData.endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cred.key}`,
            },
            dispatcher: source.proxyUrl ? getProxy(source.proxyUrl) : undefined,
            timeout:timeLimit,
        }).once({json:postJson});
    /* 以下不变 */
}
```

**`src/Interactor/GeminiRequester/PostTool.ts`** — 同样改造，注意此处的 `postPath` 拼接依赖 `modelData.endpoint`：

```ts
const fixModelId = LaMChain.specializeModelId({ source, modelId:modelData.id});
const postPath = `${modelData.endpoint}/${fixModelId}:generateContent?key=${cred.key}`;

const respData = await UtilHttp.url(source.url)
    .postJson().option({
        method: 'POST' as const,
        path: postPath,
        headers: { 'Content-Type': 'application/json' },
        dispatcher: source.proxyUrl ? getProxy(source.proxyUrl) : undefined,
        timeout:timeLimit,
    }).once({json:postJson});
```

**`src/test/test.ts`** — 手搓 `source` 的地方需同步（当前为 `{ hostname: "api.deepseek.com" }`）：

```ts
const source = { url: "https://api.deepseek.com" };
```

**`src/LaMChain/Interactor.ts`**、**`src/LaMChain/Func.ts`** — 仅消费 `source.retry` / `source.modelIdMap`，字段名不变，无需修改。

#### C. 配置数据迁移（server）

`server/data/CredCategory.json` 16 个类别逐一迁移：

| 类别 | 当前 | 迁移后 url |
|---|---|---|
| `Deepseek` | api.deepseek.com:443 | `https://api.deepseek.com` |
| `DoubleGPT` | www.doublegpt.io:443 | `https://www.doublegpt.io` |
| `Eylink` | gtapi.xiaoerchaoren.com:8932 | `https://gtapi.xiaoerchaoren.com:8932` |
| `Eylink4` | api.yesapikey.com:443 https | `https://api.yesapikey.com` |
| `Eylink5` | api.yesapikey.com:4000 http | `http://api.yesapikey.com:4000` |
| `EylinkAz` | az.yesapikey.com:443 https | `https://az.yesapikey.com` |
| `EylinkGimini` | api.yesapikey.com:4000 http | `http://api.yesapikey.com:4000` |
| `Jeniya` | jeniya.top:443 https | `https://jeniya.top` |
| `JeniyaGemini` | jeniya.top:443 https | `https://jeniya.top` |
| `Google` | generativelanguage.googleapis.com:443 | `https://generativelanguage.googleapis.com` |
| `Gptge` | api.gpt.ge:443 | `https://api.gpt.ge` |
| `GptgeGemini` | api.gpt.ge:443 | `https://api.gpt.ge` |
| `Gptus` | www.gptapi.us:443 | `https://www.gptapi.us` |
| `KedayaGrok` | kedaya.ai:443 | `https://kedaya.ai` |
| `OpenAI` | api.openai.com:443 | `https://api.openai.com` |
| `SiliconFlow` | api.siliconflow.cn:443 | `https://api.siliconflow.cn` |

`proxy_url` 保持原样（本身就已是完整 URL 字符串，合并后与 `url` 形态一致，配置风格更统一）。

---

## 四、技术细节

### 4.1 默认端口归一化

Node `URL` 会剥离**本协议自己的**默认端口（实测）：

| 输入 | `.port` |
|---|---|
| `https://a.com:443` | `''`（被剥离） |
| `http://a.com:443` | `'443'`（保留，443 非 http 默认端口） |
| `https://a.com:8443` | `'8443'` |

因此 URL 形式下显式写 `:443` 与省略等价（如 `https://api.deepseek.com:443` ≡ `https://api.deepseek.com`），语义无害。但**不应依赖回读 `.port` 来判断是否显式写了 443**。

### 4.2 大小写与非法值

`new URL()` 会归一化 scheme 大小写（`HTTP://` → `protocol === 'http:'`），因此 url 字段中 scheme 大小写不敏感。

`UtilHttp.url()` 内置白名单 `['http:','https:']`，非 http(s) scheme 会 `throwError`。当前调用链中本异常会经 `postLaMRepeat` 的重试封装逸出——此为**既有行为**（见 §1.3），本次改造不改变该性质，也不要求额外校验（配置值由 schema 在源头约束）。

### 4.3 类型一致性

`UtilHttp.url` 入参为模板字面量类型 `` `${'http:' | 'https:'}//${string}` ``。若 `url` 字段声明为普通 `string`，传参处会类型不匹配。建议在 LaM-Chain 与 LaM-Manager 各定义 `ServiceUrl` 别名（或以 LaM-Chain 为准供 LaM-Manager 导入），避免使用 `as` 收缩。

### 4.4 保留字段

以下 `SourceProvider` 字段不受影响，字段名保持不变：`name`、`proxyUrl`、`retry`、`modelIdMap`。`specializeOpenAILikeRequest` / `specializeModelId` 两个函数仅读取 `source.modelIdMap`，无需改动。

---

## 五、影响面与兼容性

### 5.1 受影响位置清单

| 文件 | 改动 |
|---|---|
| `LaM-Manager/src/CredService/Interface.ts` | `AccountCategoryData` 字段变更 |
| `LaM-Manager/src/CredService/CredProvider.ts` | 解析 url（或透传） |
| `LaM-Manager/src/Mock/Utils.ts` | mock 类别表改 url |
| `LaM-Chain/src/LaMChain/Interface.ts` | `SourceProvider` 字段变更 |
| `LaM-Chain/src/Interactor/OpenAIRequester/PostTool.ts` | 删除冗余覆盖 |
| `LaM-Chain/src/Interactor/GeminiRequester/PostTool.ts` | 删除冗余覆盖 |
| `LaM-Chain/src/test/test.ts` | source 字面量改 url |
| `server/data/CredCategory.json` | 16 个类别迁移 |
| `LaM-Manager/schema/*.schema.json` | `build-schema` 重新生成 |

### 5.2 无需改动

- `LaM-Chain/src/LaMChain/Interactor.ts`、`Func.ts`：仅消费 `retry` / `modelIdMap`
- `LaM-Manager/src/Task/**`：经 `SourceProvider` 透传，不直接读连接字段
- `LaM-Manager/src/ModelDrive/**`：`source:account.source` 整体透传
- `LaMService.json`：模型实例配置只含 `endpoint`，与本次改造正交

### 5.3 兼容性

**破坏性变更**：`AccountCategoryData` 与 `SourceProvider` 均不保留旧字段。若需灰度，可临时双写（`url` 优先，`hostname`/`port`/`protocol` 兜底），但会引入长期冗余，不建议在本次采纳。

**submodule 顺序**：选传输面方案时，LaM-Chain 需先改并 `npm run build` 出新 tgz，LaM-Manager 重新编译并打包，server 再 `npm run expand-macro && npm run compile` 安装。

---

## 六、风险

| 风险 | 说明 | 缓解 |
|---|---|---|
| 迁移笔误 | 16 条配置手工改写 | 对照本表逐条核对；改后先跑 `npm run test:unit` |
| 端口丢失 | `Eylink`(8932) / `Eylink5`(4000) / `EylinkGimini`(4000) 三个非标端口 | 迁移表中已单列，重点核对 |
| mock 未同步 | `getMockCredCategoryTable` 若漏改，单测会失败 | 已列入清单 §5.1 |
| 类型不匹配 | `string` 无法传入 `UtilHttp.url` | 使用 `ServiceUrl` 模板字面量类型（§4.3） |

---

## 七、参考

- 配置定义：`LaM-Manager/src/CredService/Interface.ts:49`（`AccountCategoryData`）
- 装配点：`LaM-Manager/src/CredService/CredProvider.ts:18`（`wrapperAccountManager`）
- 接收类型：`LaM-Chain/src/LaMChain/Interface.ts:45`（`SourceProvider`）
- 消费点：`LaM-Chain/src/Interactor/OpenAIRequester/PostTool.ts:27`、`GeminiRequester/PostTool.ts:24`
- URL 解析：`@zwa73/utils` → `utils/src/UtilHttp.ts:149`（`UtilHttp.url`）、`:27`（`RequestOption`）
- 配置数据：`server/data/CredCategory.json`
- mock 数据：`LaM-Manager/src/Mock/Utils.ts:24`

---

## 八、实施记录

**2026-10-03 已按传输面方案一次做到底**（配置面 + 传输面同时完成，未走灰度）。

### 8.1 实际改动

| 模块 | 文件 | 改动 |
|---|---|---|
| LaM-Chain | `src/LaMChain/Interface.ts` | 新增 `ServiceUrl` 导出；`SourceProvider` 三字段并为 `url` |
| LaM-Chain | `src/Interactor/OpenAIRequester/PostTool.ts` | 删除 `protocol`/`port` 局部变量与 `.option()` 冗余覆盖 |
| LaM-Chain | `src/Interactor/GeminiRequester/PostTool.ts` | 同上 |
| LaM-Chain | `src/test/test.ts` | `source` 字面量改 `{ url: "https://api.deepseek.com" } as const` |
| LaM-Manager | `src/CredService/Interface.ts` | 引入 LaM-Chain 的 `ServiceUrl`；`AccountCategoryData` 三字段并为 `url` |
| LaM-Manager | `src/CredService/CredProvider.ts` | 直接透传 `cateData.url`，未走 §3.4A 的解析回拆分支 |
| LaM-Manager | `src/Mock/Utils.ts` | mock 类别表改 `url: \`http://localhost:${port}\`` |
| server | `data/CredCategory.json` | 16 个类别全部迁移 |

`ServiceUrl` 只在 LaM-Chain 定义，LaM-Manager 以 `import type` 复用，未做本地别名——与 §4.3 的「以 LaM-Chain 为准」一致。

### 8.2 验证结果

| 步骤 | 命令 | 结果 |
|---|---|---|
| LaM-Chain 类型 | `npx tsc --noEmit -p tsconfig.json` | 通过 |
| LaM-Manager 类型 | `npm run check` | 通过 |
| LaM-Chain 编译 | `npm run compile` | 通过（LaM-Manager 经 junction 读 dist，必须先编） |
| LaM-Manager 编译 | `npm run compile` | 通过 |
| schema 生成 | `npm run build-schema` | 通过，`required` 收敛为 `["id","url"]`，新增 `ServiceUrl.schema.json` |
| Test 模块类型 | `npx tsc --noEmit -p tsconfig.json` | 通过 |
| 测试 | `Test` → `npm run test:unit` | **16 suites / 237 tests 全通过** |

测试日志中 `OpenApiPostTool.postLaMRepeat` 与 `GeminiPostTool.postLaMRepeat` 均出现，两条改造后的传输路径都被实际执行覆盖。

### 8.3 遗留

- **server 未重编**：`server/src/test/*.ts` 中的 `hostname` 属于 `UtilHttp` 的 `RequestOption` 直传（非 `SourceProvider`），不在本次范围；但 server 的 `node_modules` 仍装旧版 LaM-Manager tgz，正式使用前需 `LaM-Chain build` → `LaM-Manager build` → server `npm run expand-macro && npm run compile`。
- **既有失败（非本次引入）**：LaM-Chain 与 LaM-Manager 各自的 `npm test` 都有先于本次改动的问题——LaM-Chain 无 `jest.config.js`（且 `src/test/**` 被 gitignore），`npm test` 无 ts 转换而报 `Unexpected token`；LaM-Manager 的 `jest/LaMService/LaMManager.test.ts` 整体被注释，报 `must contain at least one test`。两者均未随本次改动变化，`git diff` 亦无涉。

---

*起草时间: 2026-10-03*
*实施完成: 2026-10-03*
