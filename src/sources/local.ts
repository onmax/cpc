import type { Source } from '../types'
import fs from 'node:fs/promises'
import pathe from 'pathe'
import glob from 'tiny-glob'
import { getIgnorer, isTextBased } from '../utils'

// Helper to check if a file exists
async function fileExists(path: string): Promise<boolean> {
  return fs.access(path).then(() => true).catch(() => false)
}

// Helper to load .gitignore files from the current folder and its parents
async function loadGitignoreFiles(startDir: string): Promise<string[]> {
  let currentDir = startDir
  const contents: string[] = []
  while (true) {
    const gitignorePath = pathe.join(currentDir, '.gitignore')
    if (await fileExists(gitignorePath)) {
      const fileContent = await fs.readFile(gitignorePath, 'utf-8')
      contents.push(fileContent)
    }
    const parentDir = pathe.dirname(currentDir)
    if (parentDir === currentDir) {
      break
    }
    currentDir = parentDir
  }
  return contents
}

export async function getLocalFiles(
  src: string,
  extraIgnore: string[],
): Promise<Source[]> {
  const absSrc = pathe.resolve(src)
  let stats
  try {
    stats = await fs.stat(absSrc)
  }
  catch (e) {
    throw new Error(`Source path does not exist: ${absSrc}. ${e}`)
  }

  const ig = getIgnorer()

  if (stats.isDirectory()) {
    const gitignoreContents = await loadGitignoreFiles(absSrc)
    for (const content of gitignoreContents) {
      ig.add(content.split('\n'))
    }
    if (extraIgnore.length > 0) {
      ig.add(extraIgnore)
    }

    const pattern = '**/*'
    const entries = await glob(pattern, { cwd: absSrc, filesOnly: true, absolute: false })

    const results: Source[] = []
    for (const entry of entries) {
      if (ig.ignores(entry)) {
        continue
      }
      const filePath = pathe.join(absSrc, entry)
      let contents = ''
      if (isTextBased(filePath)) {
        contents = await fs.readFile(filePath, 'utf-8')
      }
      results.push({
        relativePath: entry,
        contents,
      })
    }
    return results
  }
  else if (stats.isFile()) {
    const relativePath = pathe.basename(absSrc)
    if (ig.ignores(relativePath)) {
      return []
    }
    let contents = ''
    if (isTextBased(absSrc)) {
      contents = await fs.readFile(absSrc, 'utf-8')
    }
    return [{ relativePath, contents }]
  }
  else {
    return []
  }
}
