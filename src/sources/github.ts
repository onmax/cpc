import type { Source } from '../types'
import consola from 'consola'
import ignore from 'ignore'
import { ofetch } from 'ofetch'
import { isTextBased } from '../utils'

export interface GitHubRef {
  org: string
  repo: string
  path: string
}

export async function getGithubFiles(ref: GitHubRef, extraIgnore: string[]): Promise<Source[]> {
  const ig = ignore()

  try {
    const gitignoreRes = await ofetch(
      `https://ungh.cc/repos/${ref.org}/${ref.repo}/files/HEAD/.gitignore`,
      { responseType: 'json' },
    )
    if (gitignoreRes.file && gitignoreRes.file.contents) {
      ig.add(gitignoreRes.file.contents.split('\n'))
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    // .gitignore not found; continue
  }
  if (extraIgnore.length > 0) {
    ig.add(extraIgnore)
  }

  const repoInfo = await ofetch(`https://ungh.cc/repos/${ref.org}/${ref.repo}`, {
    responseType: 'json',
  })
  const branch = repoInfo.repo.defaultBranch || 'main'

  const tree = await ofetch(`https://ungh.cc/repos/${ref.org}/${ref.repo}/files/${branch}`, {
    responseType: 'json',
  })
  let files = tree.files

  if (ref.path) {
    files = files.filter((f: { path: string }) => f.path.startsWith(ref.path))
  }

  const results = []
  for (const file of files) {
    if (ig.ignores(file.path)) {
      continue
    }
    let contents = ''
    if (isTextBased(file.path)) {
      const fileData = await ofetch(
        `https://ungh.cc/repos/${ref.org}/${ref.repo}/files/${branch}/${file.path}`,
        { responseType: 'json' },
      )
      contents = fileData.file.contents
      consola.info(`Fetched ${file.path}`)
    }
    else {
      consola.info(`Skipped downloading non-text file ${file.path}`)
    }
    results.push({
      relativePath: file.path,
      contents,
    })
  }
  return results
}
