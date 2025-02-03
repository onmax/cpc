import type { Source } from '../types'
import consola from 'consola'
import ignore from 'ignore'
import { ofetch } from 'ofetch'

export interface GitHubRef {
  org: string
  repo: string
  path: string
}

export async function getGithubFiles(ref: GitHubRef, extraIgnore: string[]): Promise<Source[]> {
  const ig = ignore()

  // Try to load .gitignore from the repository via the UNGH API.
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

  // Get repository info to determine the default branch.
  const repoInfo = await ofetch(`https://ungh.cc/repos/${ref.org}/${ref.repo}`, {
    responseType: 'json',
  })
  const branch = repoInfo.repo.defaultBranch || 'main'

  // Fetch the full file tree from the default branch.
  const tree = await ofetch(`https://ungh.cc/repos/${ref.org}/${ref.repo}/files/${branch}`, {
    responseType: 'json',
  })
  let files = tree.files

  // If a path is specified, filter to only include files starting with that path.
  if (ref.path) {
    files = files.filter((f: { path: string }) => f.path.startsWith(ref.path))
  }

  const results = []
  for (const file of files) {
    if (ig.ignores(file.path)) {
      continue
    }
    const fileData = await ofetch(
      `https://ungh.cc/repos/${ref.org}/${ref.repo}/files/${branch}/${file.path}`,
      { responseType: 'json' },
    )
    const contents = fileData.file.contents
    // The relativePath is the file path within the repository.
    results.push({
      relativePath: file.path,
      contents,
    })
    consola.info(`Fetched ${file.path}`)
  }
  return results
}
