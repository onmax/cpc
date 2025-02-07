#!/usr/bin/env node
import type { GitHubRef } from './sources/github'
import process from 'node:process'
import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { description, name, version } from '../package.json'
import { copyFilesToClipboard } from './output'
import { getGithubFiles } from './sources/github'
import { getLocalFiles } from './sources/local'

const main = defineCommand({
  meta: { name, version, description },
  args: {
    source: {
      type: 'positional',
      description: 'Local path or GitHub reference (gh:org/repo/PATH or https://github.com/org/repo/PATH)',
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
    const ignorePatterns = args.ignore?.split(',') ?? []

    let files
    if (source.startsWith('gh:') || source.startsWith('https://github.com')) {
      let ref: GitHubRef
      if (source.startsWith('gh:')) {
        const refStr = source.slice(3)
        const parts = refStr.split('/')
        if (parts.length < 3) {
          consola.error('Invalid GitHub reference. Use gh:org/repo/PATH')
          process.exit(1)
        }
        const [org, repo, ...rest] = parts
        const githubPath = rest.join('/')
        ref = { org, repo, path: githubPath }
      }
      else {
        try {
          const url = new URL(source)
          const parts = url.pathname.split('/').filter(Boolean)
          if (parts.length < 2) {
            consola.error('Invalid GitHub URL. It should be https://github.com/org/repo[/PATH]')
            process.exit(1)
          }
          const org = parts[0]
          const repo = parts[1]
          let githubPath = ''
          if (parts[2] === 'blob' || parts[2] === 'tree') {
            githubPath = parts.slice(3).join('/')
          }
          else {
            githubPath = parts.slice(2).join('/')
          }
          ref = { org, repo, path: githubPath }
        }
        catch (e) {
          consola.error('Invalid GitHub URL.', e)
          process.exit(1)
        }
      }
      files = await getGithubFiles(ref, ignorePatterns)
    }
    else {
      files = await getLocalFiles(source, ignorePatterns)
    }

    await copyFilesToClipboard(files)
  },
})

runMain(main)
