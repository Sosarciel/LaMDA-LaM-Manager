---
aliases: [LaM-Manager 实施计划索引]
---
# LaM-Manager 实施计划索引

> 本文档索引 LaM-Manager 模块的所有实施计划

---

## 📋 进行中计划
```base
filters:
  and:
    - file.path.startsWith("LaMDA-Module/Service-Manager/LaM-Manager/plan")
    - file.name != "README"
    - file.folder == "plan"
views:
  - type: table
    name: 计划一览
    order:
      - file.name
      - aliases
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC

```

---

## 📁 已归档计划
```base
filters:
  and:
    - file.path.startsWith("LaMDA-Module/Service-Manager/LaM-Manager/plan/archive")
views:
  - type: table
    name: 归档一览
    order:
      - file.name
      - aliases
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC

```

---

*最后更新: 2026-03-25*
