import { input, select } from '@inquirer/prompts';

export interface Answers {
  name: string;
  displayName: string;
  description: string;
  language: 'go' | 'rust' | 'typescript';
  category: string;
  author: string;
  license: string;
}

function validateName(value: string): boolean | string {
  if (!value) return '模板名称不能为空';
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && !/^[a-z0-9]$/.test(value)) {
    return '只允许小写字母、数字和连字符，不能以连字符开头或结尾';
  }
  return true;
}

export async function askQuestions(): Promise<Answers> {
  const name = await input({
    message: '模板名称 (kebab-case)',
    validate: validateName,
  });

  const displayName = await input({
    message: '显示名称',
    validate: (v) => v.length > 0 || '显示名称不能为空',
  });

  const description = await input({
    message: '一句话描述',
    validate: (v) => v.length > 0 || '描述不能为空',
  });

  const language = await select<'go' | 'rust' | 'typescript'>({
    message: '开发语言',
    choices: [
      { value: 'go', name: 'Go (推荐 — 交叉编译最简单)' },
      { value: 'rust', name: 'Rust' },
      { value: 'typescript', name: 'TypeScript (Bun)' },
    ],
  });

  const category = await select({
    message: '分类',
    choices: [
      { value: 'government', name: '政务 (government)' },
      { value: 'education', name: '教育 (education)' },
      { value: 'business', name: '商务 (business)' },
      { value: 'academic', name: '学术 (academic)' },
      { value: 'legal', name: '法务 (legal)' },
      { value: 'resume', name: '简历 (resume)' },
      { value: 'creative', name: '创意 (creative)' },
      { value: 'other', name: '其他 (other)' },
    ],
  });

  const author = await input({
    message: '作者 (GitHub 用户名)',
    validate: (v) => v.length > 0 || '作者不能为空',
  });

  const license = await select({
    message: '许可证',
    choices: [
      { value: 'MIT', name: 'MIT' },
      { value: 'Apache-2.0', name: 'Apache-2.0' },
      { value: 'GPL-3.0', name: 'GPL-3.0' },
    ],
  });

  return { name, displayName, description, language, category, author, license };
}
