import fs from 'node:fs/promises'
import clipboardy from 'clipboardy'
import { ofetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { copyFilesToClipboard } from '../src/output'
import { getGithubFiles } from '../src/sources/github'
import { getLocalFiles } from '../src/sources/local'

// Partially mock node:fs/promises so that the default export is available.
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual('node:fs/promises')
  return {
    default: {
      ...actual,
      access: vi.fn(),
      readFile: vi.fn(),
      stat: vi.fn(),
    },
  }
})

// Partially mock clipboardy with a default export.
vi.mock('clipboardy', async () => {
  return {
    default: {
      write: vi.fn(),
    },
  }
})

// Partially mock tiny-glob with a default export.
vi.mock('tiny-glob', async () => {
  return {
    default: vi.fn(), // The tests do not use glob directly in these cases.
  }
})

// Partially mock ofetch as a named export.
vi.mock('ofetch', async () => {
  return {
    ofetch: vi.fn(),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('local files', () => {
  it('should process a local text file correctly', async () => {
    const stat = { isFile: () => true, isDirectory: () => false }
    vi.spyOn(fs, 'stat').mockResolvedValue(stat as any)
    vi.spyOn(fs, 'readFile').mockResolvedValue('file content')
    const result = await getLocalFiles('path/to/file.txt', [])
    expect(result).toEqual([{ relativePath: 'file.txt', contents: 'file content' }])
  })

  it('should process a local binary file with empty content', async () => {
    const stat = { isFile: () => true, isDirectory: () => false }
    vi.spyOn(fs, 'stat').mockResolvedValue(stat as any)
    const readFileSpy = vi.spyOn(fs, 'readFile')
    const result = await getLocalFiles('path/to/image.png', [])
    expect(result).toEqual([{ relativePath: 'image.png', contents: '' }])
    expect(readFileSpy).not.toHaveBeenCalled()
  })
})

describe('gitHub files', () => {
  it('should process a GitHub text file correctly', async () => {
    // Set up ofetch to return proper responses.
    (ofetch as any).mockImplementation((url: string) => {
      if (url.includes('/files/HEAD/.gitignore')) {
        return Promise.resolve({ file: { contents: '' } })
      }
      if (/\/repos\/org\/repo$/.test(url)) {
        return Promise.resolve({ repo: { defaultBranch: 'main' } })
      }
      if (url === 'https://ungh.cc/repos/org/repo/files/main') {
        return Promise.resolve({ files: [{ path: 'file.txt' }] })
      }
      if (url === 'https://ungh.cc/repos/org/repo/files/main/file.txt') {
        return Promise.resolve({ file: { contents: 'github file content' } })
      }
      return Promise.resolve({})
    })

    const result = await getGithubFiles({ org: 'org', repo: 'repo', path: '' }, [])
    expect(result).toEqual([{ relativePath: 'file.txt', contents: 'github file content' }])
  })

  it('should process a GitHub binary file with empty content', async () => {
    (ofetch as any).mockImplementation((url: string) => {
      if (url.includes('/files/HEAD/.gitignore')) {
        return Promise.resolve({ file: { contents: '' } })
      }
      if (/\/repos\/org\/repo$/.test(url)) {
        return Promise.resolve({ repo: { defaultBranch: 'main' } })
      }
      if (url === 'https://ungh.cc/repos/org/repo/files/main') {
        return Promise.resolve({ files: [{ path: 'image.png' }] })
      }
      if (url === 'https://ungh.cc/repos/org/repo/files/main/image.png') {
        return Promise.resolve({ file: { contents: 'binary data' } })
      }
      return Promise.resolve({})
    })

    const result = await getGithubFiles({ org: 'org', repo: 'repo', path: '' }, [])
    expect(result).toEqual([{ relativePath: 'image.png', contents: '' }])
  })
})

describe('clipboard output', () => {
  it('should copy formatted files to clipboard', async () => {
    const files = [{ relativePath: 'file.txt', contents: 'line1\nline2' }]
    await copyFilesToClipboard(files)
    expect(clipboardy.write).toHaveBeenCalled()
  })
})
