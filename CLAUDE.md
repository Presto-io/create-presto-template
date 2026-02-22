# create-presto-template — AI 开发提示词

> 本文件是 `Presto-io/create-presto-template` 仓库的 CLAUDE.md。
> 这是一个待创建的新仓库。

---

## 仓库职责

交互式 CLI 工具，帮助开发者在本地初始化 Presto 模板项目。面向喜欢手动开发（不用 GitHub Template Repository）的开发者。

用法：`npx create-presto-template`

---

## 技术栈

- **运行时：** Node.js
- **交互式 CLI：** `@inquirer/prompts`（或 `prompts`）
- **模板引擎：** 简单字符串替换（不需要复杂模板引擎）
- **发布：** npm

---

## CLI 交互流程

```
$ npx create-presto-template

  ╔═══════════════════════════════════╗
  ║   Create Presto Template  v1.0   ║
  ╚═══════════════════════════════════╝

? 模板名称 (kebab-case): my-report
? 显示名称: 报告模板
? 一句话描述: 通用商务报告排版模板
? 开发语言:
  ❯ Go (推荐 — 交叉编译最简单)
    Rust
    TypeScript (Bun)
? 分类:
    政务 (government)
    教育 (education)
  ❯ 商务 (business)
    学术 (academic)
    法务 (legal)
    简历 (resume)
    创意 (creative)
    其他 (other)
? 作者 (GitHub 用户名): mrered
? 许可证:
  ❯ MIT
    Apache-2.0
    GPL-3.0
    自定义

✓ 正在创建项目...
  ✓ 从 starter 模板生成项目结构
  ✓ 填写 manifest.json
  ✓ 配置 CI workflow

✓ 项目已创建在 ./my-report/

  下一步：
  cd my-report
  将参考文件放入 reference/ 目录
  用 AI 编程工具开始开发，或手动编写转换逻辑
  make preview  — 在 Presto 中预览
  git tag v1.0.0 && git push --tags  — 发布

  文档：https://docs.presto.app/templates
```

---

## 项目结构

```
create-presto-template/
  src/
    index.ts                 ← CLI 入口
    prompts.ts               ← 交互式问答定义
    generator.ts             ← 项目生成逻辑
    templates/               ← 各语言的项目模板文件
      go/
        main.go.tmpl
        go.mod.tmpl
        Makefile.tmpl
        release.yml.tmpl
      rust/
        Cargo.toml.tmpl
        src/main.rs.tmpl
        Makefile.tmpl
        release.yml.tmpl
      typescript/
        src/index.ts.tmpl
        package.json.tmpl
        Makefile.tmpl
        release.yml.tmpl
      shared/                ← 各语言共享的文件
        manifest.json.tmpl
        example.md.tmpl
        CONVENTIONS.md       ← 直接复制，不做模板替换
        CLAUDE.md.tmpl
        AGENTS.md.tmpl
        cursor-rules.tmpl
        README.md.tmpl
        LICENSE-MIT.tmpl
        LICENSE-Apache.tmpl
        gitignore.tmpl
        reference-README.md
  package.json
  tsconfig.json
  CLAUDE.md                  ← 本文件
  README.md
```

---

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

---

## 生成逻辑

```typescript
// generator.ts 伪代码

async function generate(answers: Answers) {
  const targetDir = path.join(process.cwd(), answers.name);

  // 1. 创建目录
  await fs.mkdir(targetDir, { recursive: true });

  // 2. 复制语言特定文件
  const langDir = `templates/${answers.language}`;
  for (const file of await glob(`${langDir}/**/*.tmpl`)) {
    const content = await fs.readFile(file, 'utf-8');
    const rendered = replaceVariables(content, answers);
    const destPath = file.replace('.tmpl', '').replace(langDir, targetDir);
    await fs.writeFile(destPath, rendered);
  }

  // 3. 复制共享文件
  // manifest.json, example.md, CONVENTIONS.md, AI 配置等

  // 4. 创建 reference/ 目录
  await fs.mkdir(path.join(targetDir, 'reference'));
  await fs.copyFile('templates/shared/reference-README.md',
                     path.join(targetDir, 'reference', 'README.md'));

  // 5. 创建 .github/workflows/
  // 6. 生成 LICENSE

  // 7. 初始化 git
  execSync('git init', { cwd: targetDir });
  execSync('git add -A', { cwd: targetDir });
  execSync('git commit -m "chore: initial template from create-presto-template"',
           { cwd: targetDir });
}
```

---

## 各语言 Release CI 模板

### Go (`release.yml.tmpl`)

```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    strategy:
      matrix:
        goos: [darwin, linux, windows]
        goarch: [amd64, arm64]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Build
        env:
          GOOS: ${{ matrix.goos }}
          GOARCH: ${{ matrix.goarch }}
        run: |
          EXT=""
          if [ "$GOOS" = "windows" ]; then EXT=".exe"; fi
          go build -o "presto-template-{{name}}-${GOOS}-${GOARCH}${EXT}" .
      - name: Upload
        uses: softprops/action-gh-release@v2
        with:
          files: presto-template-{{name}}-*

  checksums:
    needs: release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Download release assets
        # 下载所有二进制，生成 SHA256SUMS，上传
```

### Rust (`release.yml.tmpl`)

使用 `cross` 工具进行交叉编译：

```yaml
    strategy:
      matrix:
        include:
          - target: x86_64-apple-darwin
            os: macos-latest
            artifact: presto-template-{{name}}-darwin-amd64
          - target: aarch64-apple-darwin
            os: macos-latest
            artifact: presto-template-{{name}}-darwin-arm64
          - target: x86_64-unknown-linux-gnu
            os: ubuntu-latest
            artifact: presto-template-{{name}}-linux-amd64
          - target: aarch64-unknown-linux-gnu
            os: ubuntu-latest
            artifact: presto-template-{{name}}-linux-arm64
          - target: x86_64-pc-windows-msvc
            os: windows-latest
            artifact: presto-template-{{name}}-windows-amd64.exe
          - target: aarch64-pc-windows-msvc
            os: windows-latest
            artifact: presto-template-{{name}}-windows-arm64.exe
```

### TypeScript/Bun (`release.yml.tmpl`)

使用 `bun build --compile` 进行编译：

```yaml
    steps:
      - uses: oven-sh/setup-bun@v2
      - name: Build
        run: bun build --compile --target=${{ matrix.target }} src/index.ts --outfile ${{ matrix.artifact }}
```

---

## CLAUDE.md 模板

生成到各个新项目中的 CLAUDE.md 内容：

```markdown
# {{displayName}}

Presto 模板项目。请阅读并遵循 CONVENTIONS.md 中的所有指令。

## 快速参考

- `make build` — 编译二进制
- `make preview` — 安装到 Presto 并预览
- `make test` — 运行基础测试
- 参考文件在 `reference/` 目录中
- 技术规范见 CONVENTIONS.md

## 开发任务

请检查 `reference/` 目录中的文件，按照 CONVENTIONS.md 中描述的流程，
帮助我开发这个模板的转换逻辑。
```

---

## npm 发布配置

```json
{
  "name": "create-presto-template",
  "version": "1.0.0",
  "description": "Create a new Presto template project",
  "bin": {
    "create-presto-template": "./dist/index.js"
  },
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@inquirer/prompts": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "keywords": ["presto", "template", "typst", "markdown", "scaffold"],
  "license": "MIT"
}
```

---

## 注意事项

- CLI 输出使用中文（目标用户主要是中文用户）
- 模板名称校验：只允许 `[a-z0-9-]`，不能以 `-` 开头或结尾
- 生成的 `.github/workflows/release.yml` 必须能直接运行（不需要用户修改）
- CONVENTIONS.md 直接复制到新项目，不做变量替换
- 完成任务后立即 commit，消息用中文
