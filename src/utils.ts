import ignore from 'ignore'
import { extname } from 'pathe'

const allowedExtensions = [
  '.md',
  '.mdx',
  '.txt',
  '.html',
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.scss',
  '.less',
  '.json',
  '.json5',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.graphql',
  '.astro',
  '.svelte',
  '.vue',
  '.py',
  '.rs',
  '.php',
]

export function isTextBased(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase()
  return allowedExtensions.includes(ext)
}

const ignoreByDefault = [
  '.git',
  '.DS_Store',
  'node_modules',
  'pnpm-lock.yaml',
  'yarn.lock',
  'dist',
  '*.spec.*',
  'bun.lockb',
  '.bun',
  '.data',
  '.nuxt',
  '.vercel',
  '.vscode',
  '*.log',
  '*.lock',
  '*.pid',
  '*.seed',
  '*.cache',
  '.env',
]

export function getIgnorer(): ignore.Ignore {
  const ig = ignore()
  for (const pattern of ignoreByDefault) {
    ig.add(pattern)
  }
  return ig
}
