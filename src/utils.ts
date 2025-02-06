import { extname } from 'pathe'

const allowedExtensions = [
  '.md',
  '.mdx',
  '.txt',
  '.html',
  '.js',
  '.ts',
  '.jsx',
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
