#!/usr/bin/env node
import type { GitHubRef } from './sources/github'
import process from 'node:process'
import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { copyFilesToClipboard } from './output'
import { getGithubFiles } from './sources/github'
import { getLocalFiles } from './sources/local'

const main = defineCommand({
  meta: {
    name: 'cpnow',
    version: '1.0.0',
    description: 'Retrieve files from a local folder or a GitHub repo',
  },
  args: {
    source: {
      type: 'positional',
      description: 'Local path or GitHub reference (gh:org/repo/PATH)',
      required: true,
    },
    ignore: {
      type: 'string',
      alias: 'i',
      description: 'Ignore patterns (tiny-glob format)',
    },
  },
  async run({ args }) {
    const { source } = args
    const ignorePatterns = args.ignore?.split(',') ?? ['*.test.*']

    let files
    if (source.startsWith('gh:')) {
      const refStr = source.slice(3)
      const parts = refStr.split('/')
      if (parts.length < 3) {
        consola.error('Invalid GitHub reference. Use gh:org/repo/PATH')
        process.exit(1)
      }
      const [org, repo, ...rest] = parts
      const githubPath = rest.join('/')
      const ref: GitHubRef = { org, repo, path: githubPath }
      files = await getGithubFiles(ref, ignorePatterns)
    }
    else {
      files = await getLocalFiles(source, ignorePatterns)
    }

    copyFilesToClipboard(files)
  },
})

runMain(main)
