import {DAO_SERVICE} from './constants'

type ImageJSONResourceType = {
  resource: {
    // image mimie
    type: string
    url: string
  }
}

enum IMAGE_FORMAT_TYPE {
  URL,
  OSS_FILE_ID,
}

/**
 *
 * @param source
 * @param formatAssert 图片数据源字符串结构
 * @returns
 */
export function extractAssetUrl(
  source: string | undefined,
  formatAssert?: IMAGE_FORMAT_TYPE,
) {
  if (!source) return ''
  const format = formatAssert || imgStrFormatDetect(source)

  if (format === IMAGE_FORMAT_TYPE.OSS_FILE_ID) {
    const [fileType, fileId, fileName] = source.split('-')
    return `${DAO_SERVICE}/api/v1/file/download?fileId=${fileId}&fileType=${fileType}`
  }

  return source
}

function imgStrFormatDetect(source: string) {
  if (source[1] === '-') return IMAGE_FORMAT_TYPE.OSS_FILE_ID
  return IMAGE_FORMAT_TYPE.URL
}

export function parseFileComposeId(fileComposeId: string) {
  if (fileComposeId[1] !== '-') return null
  const [fileType, fileId, ...rest] = fileComposeId.split('-')
  const fileName = rest.join('-')
  return {
    fileType,
    fileId,
    fileName,
    url: `${DAO_SERVICE}/api/v1/file/download?fileId=${fileId}&fileType=${fileType}&autoDownload=false`,
  }
}
