import clipboardy from 'clipboardy'
import { extname } from 'pathe'

const tags = {
  docs: ['.md', '.mdx', '.txt', '.html'],
  code: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.less', '.json', '.json5', '.yaml', '.yml', '.toml', '.xml', '.graphql', '.astro', '.svelte', '.vue', '.py', '.rs', '.php'],
}

export async function copyFilesToClipboard(
  files: { relativePath: string, contents: string }[],
): Promise<void> {
  // longest file name
  const separator = files.reduce((acc, file) => Math.max(acc, file.relativePath.length), 0)
  const separatorStr = '='.repeat(separator)
  let finalOutput = `${separatorStr}\n`

  for (const file of files) {
    // Split file contents into lines.
    const lines = file.contents.split('\n')
    // Determine the width needed for the line numbers.
    const totalLines = lines.length
    const padWidth = String(totalLines).length

    // Build the formatted output.
    let formatted = ``
    formatted += `// ./${file.relativePath}\n\n`
    lines.forEach((line, idx) => {
      const lineNumber = String(idx + 1).padStart(padWidth, ' ')
      formatted += `${lineNumber} | ${line}\n`
    })
    formatted += `${separatorStr}\n`
    finalOutput += formatted
  }

  let tag = 'context'

  const isCode = files.every(file => tags.code.includes(extname(file.relativePath)))
  if (isCode)
    tag = 'code'

  const isDocs = files.every(file => tags.docs.includes(extname(file.relativePath)))
  if (isDocs)
    tag = 'docs'

  finalOutput = `<${tag}>\n${finalOutput.trim()}\n</${tag}>`

  // Copy the final formatted output to the clipboard.
  await clipboardy.write(finalOutput.trim())
}
