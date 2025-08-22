import {StyleSheet} from 'react-native'
import {type ImagePickerAsset} from 'expo-image-picker'
import {$Typed, AppBskyEmbedImages, type RichText} from '@atproto/api'

import {DAO_SERVICE, PUBLIC_BSKY_SERVICE} from '#/lib/constants'
import server from '#/server'
import {type ProposalBlockType} from './state'

export function renderBlockToHTML(
  block: ProposalBlockType,
  uploadedEmbed: Awaited<ReturnType<typeof uploadEmbeds>>,
  uploaderDid: string,
) {
  let mediaDom = ''
  if (uploadedEmbed) {
    if (uploadedEmbed.images) {
      mediaDom = uploadedEmbed.images
        .map((embed, index) => {
          return `<div style="${imgBoxStyle}"><img style="${imgStyle}" src="${embed.url}" alt="image" /></div>`
        })
        .join('')
    }
    if (uploadedEmbed.video) {
      mediaDom = `<div style="${videoBoxStyle}"><video controls autoPlay loop muted playsInline style="${videoStyle}"><source src="${uploadedEmbed.video}" type="${uploadedEmbed.mime}" /></video></div>`
    }

    mediaDom = `\n<div style="${mediaBoxStyle}">${mediaDom}</div>`
  }

  if (block.type === 'content') {
    return `<div class="proposal-content" style="${contentStyle}">${mapMultilineTextToHtml(
      block.richtext,
    )}</div>${mediaDom}`
  }
  if (block.type === 'module-title') {
    return `<div class="proposal-module-title" style="${h2Style}">${mapMultilineTextToHtml(
      block.richtext,
    )}</div>`
  }
  return `<p>unknwon block type: ${block.type}</p>`
}

function mapMultilineTextToHtml(rt: RichText) {
  let outputStr = ''
  if (rt.facets?.length) {
    // const list = [];
    let startIndex = 0
    const uint8Arr = rt.unicodeText.utf8
    rt.facets.forEach(item => {
      const isUrl = item.features[0].$type === 'app.bsky.richtext.facet#link'
      const isMention =
        item.features[0].$type === 'app.bsky.richtext.facet#mention'
      if (!isUrl) {
        //  && !isMention
        console.log('unknown richtext feature:', rt)
        return
      }
      const {byteStart, byteEnd} = item.index
      if (byteStart !== startIndex) {
        const iStr = new TextDecoder().decode(
          uint8Arr.slice(startIndex, byteStart),
        )
        outputStr += iStr
        // list.push(iStr);
        startIndex = byteStart
      }
      const {did, uri} = item.features[0]
      const url = new TextDecoder().decode(uint8Arr.slice(startIndex, byteEnd))
      const iStr = `<a target="_blank" href="${
        isMention ? `${window.location.origin}/profile/${did}` : uri
      }" style="${alinkStyle}">${url}</a>`
      outputStr += iStr
      // list.push(iStr);
      startIndex = byteEnd
    })
    if (startIndex !== uint8Arr.length) {
      const iStr = new TextDecoder().decode(
        uint8Arr.slice(startIndex, uint8Arr.length),
      )
      outputStr += iStr
      // list.push(iStr);
      startIndex = uint8Arr.length
    }
    // console.log('with facet', list);
  } else {
    outputStr = rt.unicodeText.toString()
  }

  console.log('before output', outputStr)

  return outputStr
}

export async function uploadEmbeds(block: ProposalBlockType) {
  if (block.embed.media?.type === 'images') {
    const resList = await Promise.all(
      block.embed.media.images.map(image =>
        server.dao('POST /file/upload', {
          file: image.source.file!,
          fileType: 1,
        }),
      ),
    )
    const images = resList.map(res => ({
      url: `${DAO_SERVICE}/api/v1/file/download?fileId=${
        res?.fileId.split('-')[1]
      }&fileType=1`,
    }))
    return {
      images,
    }
  }

  if (
    block.embed.media?.type === 'video' &&
    block.embed.media.video.status === 'done'
  ) {
    return {
      mime: block.embed.media.video.asset.mimeType,
      video: `${DAO_SERVICE}/api/v1/file/download?fileId=${
        block.embed.media.video?.fileId.split('-')[1]
      }&fileType=2`,
    }
  }

  return undefined
}

export function videoInfoToFile(asset: ImagePickerAsset): File {
  var arr = asset.uri.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], 'video.mp4', {type: mime})
}

// const lineStyle = ['margin: 0', 'padding: 0'].join(';')

const alinkStyle = [
  'color: rgb(16, 131, 254)',
  'text-decoration-line: none',
].join(';')

const contentStyle = [
  'padding-top: 16px',
  'color: rgb(11, 15, 20)',
  'font-size: 14px',
  'line-height: 22px',
  'white-space:pre-wrap',
  'word-break:break-all',
  'margin: 0',
].join(';')

const h2Style = [
  'margin-top: 16px',
  'padding: 12px',
  'border-radius: 6px',
  'background-color: rgba(16, 131, 254, 0.1)',
  'font-size: 16px',
  'line-height: 20px',
  'color: rgb(11, 15, 20)',
  'white-space:pre-wrap',
  'word-break:break-all',
  'margin-bottom: 0',
].join(';')

const mediaBoxStyle = [
  'margin-top: 16px',
  'display: flex',
  'flex-direction: row',
  'gap: 8px',
  'justify-content: center',
  // "max-height: 180px"
].join(';')

const imgStyle = [
  'position: absolute',
  'width: 100%',
  'height: 100%',
  'object-fit: cover',
].join(';')

const imgBoxStyle = [
  'position: relative',

  'max-height: 50%',
  'max-width: 50%',
  'flex: 1 1 0',
  'border-radius: 8px',
  'overflow: hidden',
  'aspect-ratio: 1 / 1',
].join(';')

const videoBoxStyle = ['border-radius: 8px', 'overflow: hidden'].join(';')

const videoStyle = ['width: 100%', 'height: 100%', 'object-fit: cover'].join(
  ';',
)
