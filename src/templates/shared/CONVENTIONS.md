# Template Development Conventions

本文档已迁移至中心位置，请访问：

**<https://github.com/Presto-io/Presto-Homepage/blob/main/docs/conventions.md>**

（或 Presto 官网文档页面，如果已部署）

此文件保留是为了让 AI 工具能找到它。完整开发规范请点击上方链接。

## 模板协议兜底要求

- 默认模式：stdin Markdown -> stdout Typst。
- stdout 中的 Typst 必须非空；空字符串或纯空白输出视为转换失败。
- 转换失败必须向 stderr 写入错误信息，并以非 0 状态退出。
- 模板不得吞掉异常后返回空 Typst，因为 Presto 会把退出码为 0 的 stdout 继续交给 Typst 编译。
- `--manifest`、`--example`、`--version`、`--info` 不受默认转换模式校验影响。
