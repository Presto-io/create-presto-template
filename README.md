# create-presto-template

> 交互式 CLI 工具，帮助开发者在本地初始化 Presto 模板项目。

## 用法

```bash
npx create-presto-template
```

```
  ╔═══════════════════════════════════╗
  ║   Create Presto Template  v1.0   ║
  ╚═══════════════════════════════════╝

? 模板名称 (kebab-case): my-report
? 显示名称: 报告模板
? 一句话描述: 通用商务报告排版模板
? 开发语言: Go (推荐 — 交叉编译最简单)
? 分类: 商务 (business)
? 作者 (GitHub 用户名): your-name
? 许可证: MIT

✓ 项目已创建在 ./my-report/
```

## 支持的语言

| 语言 | 构建工具 | 说明 |
|------|---------|------|
| **Go** | `go build` | 推荐，交叉编译最简单 |
| **Rust** | `cargo` / `cross` | 性能最优 |
| **TypeScript** | `bun build --compile` | 前端开发者友好 |

## 生成的项目结构

```
my-report/
  main.go              ← 转换逻辑（语言因选择而异）
  manifest.json        ← 模板元数据
  example.md           ← 示例输入文档
  Makefile             ← build / preview / test
  reference/           ← 放入排版参考文件
  CONVENTIONS.md       ← 完整开发指南
  CLAUDE.md            ← AI 编程工具配置
  .github/workflows/
    release.yml        ← 6 平台自动构建
```

## 开发

```bash
git clone https://github.com/Presto-io/create-presto-template.git
cd create-presto-template
npm install
npm run build
npm start
```

## 许可证

MIT
