# LaM-Manager

LaMDA 核心语言模型管理器，提供统一的 LLM 服务抽象层。

---

## 📋 实施计划

- [[plan/README|查看所有计划]]

---

## 功能概述

- **多模型支持**：内置 Gemini、OpenAI、Deepseek 等主流 LLM 适配器
- **任务类型**：支持 Chat（对话）和 Instruct（指令）两种任务模式
- **凭证管理**：统一的 API Key 凭证管理与代理池支持
- **Token 计算**：内置 Tokenizer 用于上下文长度估算

## 目录结构

```
src/
├── LaMService/       # 核心管理器与服务接口
├── Interactor/       # LLM 交互适配器(Gemini/OpenAI)
├── Task/             # Chat/Instruct 任务处理器
├── ModelDrive/       # 模型驱动层(HttpApi/Test)
├── RequestFormat/    # 请求格式化器
├── ResponseFormat/   # 响应解析器
├── CredService/      # 凭证管理服务
└── Tokensizer/       # Token 计算器
```

---

*最后更新: 2026-03-25*
