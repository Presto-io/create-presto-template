# create-presto-template — AI 开发指南

> 组织级规则见 `../Presto-homepage/docs/ai-guide.md`

交互式 CLI 工具，帮助开发者初始化 Presto 模板项目。用法：`npx create-presto-template`

## 技术栈

- **运行时：** Node.js + TypeScript
- **交互式 CLI：** `@inquirer/prompts`
- **模板引擎：** 简单字符串替换
- **发布：** npm

## 项目结构

```
src/
  index.ts         ← CLI 入口
  prompts.ts       ← 交互式问答定义
  generator.ts     ← 项目生成逻辑
  templates/       ← 各语言的 .tmpl 文件
    go/            ← Go 模板文件
    rust/          ← Rust 模板文件
    typescript/    ← TypeScript/Bun 模板文件
    shared/        ← 共享文件（manifest、CONVENTIONS.md、AI 配置等）
```

## 开发命令

```bash
npm run build    # 编译 TypeScript
npm run start    # 本地测试运行
```

## 关键约束

- CLI 输出使用中文（目标用户主要是中文用户）
- 模板名称校验：只允许 `[a-z0-9-]`，不能以 `-` 开头或结尾
- 生成的 `.github/workflows/release.yml` 必须能直接运行（不需要用户修改）
- CONVENTIONS.md 直接复制到新项目，不做变量替换
- 生成的项目中 manifest.json 和 example.md 是编译时嵌入二进制的，不是运行时读取的

## 模板变量

各 `.tmpl` 文件中使用 `{{variable}}` 占位符，生成时替换：

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{name}}` | CLI 输入 | `my-report` |
| `{{displayName}}` | CLI 输入 | `报告模板` |
| `{{description}}` | CLI 输入 | `通用商务报告排版模板` |
| `{{author}}` | CLI 输入 | `mrered` |
| `{{license}}` | CLI 输入 | `MIT` |
| `{{category}}` | CLI 输入 | `business` |
| `{{year}}` | 当前年份 | `2026` |
| `{{prestoVersion}}` | 硬编码 | `0.1.0` |
