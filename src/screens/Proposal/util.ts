export type HTMLBlock =
  | {type: 'html'; content: string}
  | {type: 'images'; srcs: string[]}

export default function parserHTMLFile(htmlContent: string): HTMLBlock[] {
  const lines = htmlContent.split('\n')
  const mergedLines: HTMLBlock[] = []
  let iLine = ''
  lines.forEach(line => {
    // get multiple imgs src link
    if (line.startsWith('<div') && line.includes('<img')) {
      mergedLines.push({type: 'html', content: iLine})
      iLine = ''

      const imgSrcs = line.match(/src="([^"]+)"/g)
      const list = imgSrcs!.map(src => src.replace(/src="([^"]+)"/, '$1'))
      mergedLines.push({
        type: 'images',
        srcs: list,
      })
      return
    }
    iLine += line + '\n'
    return
    // return {type: 'html', content: line}
  })

  if (iLine) {
    mergedLines.push({type: 'html', content: iLine})
  }
  return mergedLines
}
