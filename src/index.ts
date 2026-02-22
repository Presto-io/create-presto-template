#!/usr/bin/env node

import { askQuestions } from './prompts.js';
import { generate } from './generator.js';

const VERSION = '1.0.0';

function printBanner() {
  console.log();
  console.log('  ╔═══════════════════════════════════╗');
  console.log(`  ║   Create Presto Template  v${VERSION}   ║`);
  console.log('  ╚═══════════════════════════════════╝');
  console.log();
}

async function main() {
  printBanner();

  try {
    const answers = await askQuestions();

    console.log();
    console.log('✓ 正在创建项目...');

    const targetDir = await generate(answers);

    console.log('  ✓ 从 starter 模板生成项目结构');
    console.log('  ✓ 填写 manifest.json');
    console.log('  ✓ 配置 CI workflow');
    console.log();
    console.log(`✓ 项目已创建在 ./${answers.name}/`);
    console.log();
    console.log('  下一步：');
    console.log(`  cd ${answers.name}`);
    console.log('  将参考文件放入 reference/ 目录');
    console.log('  用 AI 编程工具开始开发，或手动编写转换逻辑');
    console.log('  make preview  — 在 Presto 中预览');
    console.log('  git tag v1.0.0 && git push --tags  — 发布');
    console.log();
    console.log('  文档：https://docs.presto.app/templates');
    console.log();
  } catch (error) {
    if ((error as Error).name === 'ExitPromptError') {
      console.log('\n已取消。');
      process.exit(0);
    }
    throw error;
  }
}

main();
