# 代码风格与标准

## 1. 缩进与格式
- **缩进**：使用 4 个空格进行缩进，不使用制表符（tab）
- **行宽**：建议每行不超过 120 个字符
- **大括号**：使用 Allman 风格（新行开始，新行结束）
- **分号**：必须使用分号结束语句
- **空格**：
  - 运算符两侧添加空格
  - 逗号后添加空格
  - 大括号内侧添加空格

## 2. 命名规范
- **变量**：使用小驼峰命名法（camelCase）
- **函数**：使用小驼峰命名法（camelCase）
- **类**：使用大驼峰命名法（PascalCase）
- **常量**：使用全大写加下划线（SNAKE_CASE）
- **类型**：使用大驼峰命名法（PascalCase）
- **接口**：使用大驼峰命名法，前缀为 `I`（例如：`IUserInterface`）

## 3. 导入规范
- **导入位置**：所有导入语句必须放在文件顶部
- **导入顺序**：
  1. 外部依赖
  2. 内部模块
  3. 相对路径导入
- **禁止行内内联导入**：禁止使用 `import("...")` 这种行内导入方式
- **导入类型**：使用 `import type` 导入类型

## 4. 注释规范
- **JSDoc**：
  - 函数、类、接口必须使用 JSDoc 注释
  - JSDoc 第一行不留空
  - 单行文本注释直接写一行，不要分三行
  - 使用 `@param` 标注参数
  - 使用 `@returns` 标注返回值
  - 使用 `@async` 标注异步函数
- **行内注释**：使用 `//` 进行简短注释
- **块注释**：使用 `/* */` 进行较长注释

## 5. 类型规范
- **避免 `any` 类型**：尽量使用具体类型，避免使用 `any`
- **类型定义**：使用 `type` 定义类型别名
- **接口定义**：使用 `interface` 定义接口
- **泛型**：合理使用泛型提高代码复用性

## 6. 错误处理
- **Promise 错误**：使用 `try/catch` 或 `.catch()` 处理 Promise 错误
- **参数验证**：对输入参数进行验证，使用 `SLogger` 记录错误信息

## 7. 性能优化
- **懒加载**：使用 `lazyFunction` 进行懒加载
- **缓存**：使用 `memoize` 缓存计算结果

## 8. 代码组织
- **文件结构**：按照功能模块组织文件
- **导出**：使用 `export` 和 `export default` 合理导出
- **命名空间**：合理使用命名空间避免命名冲突

## 9. 测试规范
- **测试文件**：放在 `__tests__` 目录或与被测试文件同目录
- **测试命名**：测试函数以 `test_` 或 `it_` 开头
- **测试覆盖**：确保关键功能有测试覆盖

## 10. 版本控制
- **提交信息**：使用清晰的提交信息，遵循 conventional commits 规范
- **分支管理**：使用 feature branches 进行开发
- **代码审查**：提交代码前进行自我审查

## 11. 编译流程
- **编译验证**：先用 `npm run check` 测试是否有类型错误，通过后再使用 `npm run compile` 进行完整编译

## 示例代码

```typescript
// 正确的导入方式
import { SLogger } from "@zwa73/utils";
import type { OpenAITextRequest } from "RequestFormat";
import { getTokensizer } from "Tokensizer";

// 错误的导入方式（禁止）
// const { getTokensizer } = await import("Tokensizer");

/**
 * 示例函数
 * @param name - 名称
 * @returns 问候语
 */
export function greet(name: string): string {
    return `Hello, ${name}!`;
}
```
