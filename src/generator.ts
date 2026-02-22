import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { Answers } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRESTO_VERSION = '0.1.0';

interface TemplateVars {
  name: string;
  displayName: string;
  description: string;
  author: string;
  license: string;
  category: string;
  year: string;
  prestoVersion: string;
}

function buildVars(answers: Answers): TemplateVars {
  return {
    name: answers.name,
    displayName: answers.displayName,
    description: answers.description,
    author: answers.author,
    license: answers.license,
    category: answers.category,
    year: new Date().getFullYear().toString(),
    prestoVersion: PRESTO_VERSION,
  };
}

function replaceVariables(content: string, vars: TemplateVars): string {
  return content
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{displayName\}\}/g, vars.displayName)
    .replace(/\{\{description\}\}/g, vars.description)
    .replace(/\{\{author\}\}/g, vars.author)
    .replace(/\{\{license\}\}/g, vars.license)
    .replace(/\{\{category\}\}/g, vars.category)
    .replace(/\{\{year\}\}/g, vars.year)
    .replace(/\{\{prestoVersion\}\}/g, vars.prestoVersion);
}

async function getTemplateFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath ?? e.path, e.name));
}

export async function generate(answers: Answers): Promise<string> {
  const vars = buildVars(answers);
  const targetDir = path.join(process.cwd(), answers.name);
  const templatesDir = path.join(__dirname, 'templates');

  // 1. 创建目标目录
  await fs.mkdir(targetDir, { recursive: true });

  // 2. 复制语言特定文件
  const langDir = path.join(templatesDir, answers.language);
  const langFiles = await getTemplateFiles(langDir);

  for (const file of langFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const rendered = replaceVariables(content, vars);
    const relativePath = path.relative(langDir, file).replace(/\.tmpl$/, '');

    // release.yml 放到 .github/workflows/
    let destPath: string;
    if (relativePath === 'release.yml') {
      destPath = path.join(targetDir, '.github', 'workflows', 'release.yml');
    } else {
      destPath = path.join(targetDir, relativePath);
    }

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, rendered);
  }

  // 3. 复制共享文件
  const sharedDir = path.join(templatesDir, 'shared');
  const sharedFiles = await getTemplateFiles(sharedDir);

  for (const file of sharedFiles) {
    const fileName = path.basename(file);
    const content = await fs.readFile(file, 'utf-8');

    // CONVENTIONS.md 直接复制，不做变量替换
    const isRawCopy = fileName === 'CONVENTIONS.md' || fileName === 'reference-README.md';
    const rendered = isRawCopy ? content : replaceVariables(content, vars);

    let destPath: string;
    if (fileName === 'reference-README.md') {
      destPath = path.join(targetDir, 'reference', 'README.md');
    } else if (fileName === 'gitignore.tmpl') {
      destPath = path.join(targetDir, '.gitignore');
    } else if (fileName === 'cursor-rules.tmpl') {
      destPath = path.join(targetDir, '.cursor', 'rules');
    } else {
      destPath = path.join(targetDir, fileName.replace(/\.tmpl$/, ''));
    }

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, rendered);
  }

  // 4. 生成 LICENSE
  if (answers.license === 'MIT') {
    // LICENSE-MIT.tmpl 已经通过 shared 文件处理，重命名为 LICENSE
    const licenseContent = await fs.readFile(path.join(targetDir, 'LICENSE-MIT'), 'utf-8');
    await fs.writeFile(path.join(targetDir, 'LICENSE'), licenseContent);
    await fs.unlink(path.join(targetDir, 'LICENSE-MIT'));
    // 删除另一个 LICENSE 文件
    try { await fs.unlink(path.join(targetDir, 'LICENSE-Apache')); } catch {}
  } else if (answers.license === 'Apache-2.0') {
    const licenseContent = await fs.readFile(path.join(targetDir, 'LICENSE-Apache'), 'utf-8');
    await fs.writeFile(path.join(targetDir, 'LICENSE'), licenseContent);
    await fs.unlink(path.join(targetDir, 'LICENSE-Apache'));
    try { await fs.unlink(path.join(targetDir, 'LICENSE-MIT')); } catch {}
  } else {
    // GPL-3.0 或其他，创建占位 LICENSE
    await fs.writeFile(path.join(targetDir, 'LICENSE'), `${answers.license}\n`);
    try { await fs.unlink(path.join(targetDir, 'LICENSE-MIT')); } catch {}
    try { await fs.unlink(path.join(targetDir, 'LICENSE-Apache')); } catch {}
  }

  // 5. 初始化 git
  execSync('git init', { cwd: targetDir, stdio: 'ignore' });
  execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
  execSync('git commit -m "chore: initial template from create-presto-template"', {
    cwd: targetDir,
    stdio: 'ignore',
  });

  return targetDir;
}
