import {type ImagePickerAsset} from 'expo-image-picker'
import {AppBskyFeedPostgate, RichText} from '@atproto/api'
import {format} from 'date-fns'
import {nanoid} from 'nanoid/non-secure'

import {type SelfLabel} from '#/lib/moderation'
import {shortenLinks} from '#/lib/strings/rich-text-manip'
import {type ComposerImage} from '#/state/gallery'
import {type Gif} from '#/state/queries/tenor'
import {ThreadgateAllowUISetting} from '#/state/queries/threadgate'
import {
  createVideoState,
  type VideoAction,
  type VideoMedia,
  videoReducer,
} from './video'

type ImagesMedia = {
  type: 'images'
  images: ComposerImage[]
}

const MAX_IMAGES = 4

export type ProposalState = {
  blocks: ProposalBlockType[]
  endDate: string
  activeBlockIndex: number
  mutableNeedsFocusActive: boolean
}
export type BlockAction =
  | {type: 'update_richtext'; richtext: RichText}
  | {type: 'update_labels'; labels: SelfLabel[]}
  | {type: 'embed_add_images'; images: ComposerImage[]}
  | {type: 'embed_update_image'; image: ComposerImage}
  | {type: 'embed_remove_image'; image: ComposerImage}
  | {
      type: 'embed_add_video'
      asset: ImagePickerAsset
    }
  | {type: 'embed_remove_video'}
  | {type: 'embed_update_video'; videoAction: VideoAction}
  | {type: 'embed_add_uri'; uri: string}
  | {type: 'embed_remove_quote'}
  | {type: 'embed_remove_link'}
// | { type: 'embed_add_gif'; gif: Gif }
// | { type: 'embed_update_gif'; alt: string }
// | { type: 'embed_remove_gif' }

export type ProposalAction =
  // | { type: 'update_postgate'; postgate: AppBskyFeedPostgate.Record }
  // | { type: 'update_threadgate'; threadgate: ThreadgateAllowUISetting[] }
  | {
      type: 'update_block'
      blockId: string
      blockAction: BlockAction
    }
  | {
      type: 'add_block'
      blockType: ProposalBlockType['type']
    }
  | {
      type: 'remove_block'
      blockId: string
    }
  | {
      type: 'focus_block'
      blockId: string
    }
  | {type: 'set_end_date'; date: ProposalState['endDate']}

type Link = {
  type: 'link'
  uri: string
}

export type ProposalBlockType = {
  id: string
  type: 'title' | 'module-title' | 'content'
  richtext: RichText
  labels: SelfLabel[]
  embed: {
    quote: Link | undefined
    media: ImagesMedia | VideoMedia | undefined
    link: Link | undefined
  }
  shortenedGraphemeLength: number
}

export function proposalReducer(
  state: ProposalState,
  action: ProposalAction,
): ProposalState {
  switch (action.type) {
    // case 'update_postgate': {
    //   return {
    //     ...state,
    //     thread: {
    //       ...state.thread,
    //       postgate: action.postgate,
    //     },
    //   }
    // }
    // case 'update_threadgate': {
    //   return {
    //     ...state,
    //     thread: {
    //       ...state.thread,
    //       threadgate: action.threadgate,
    //     },
    //   }
    // }
    case 'update_block': {
      let nextBlocks = state.blocks
      const postIndex = state.blocks.findIndex(p => p.id === action.blockId)
      if (postIndex !== -1) {
        nextBlocks = state.blocks.slice()
        nextBlocks[postIndex] = blockReducer(
          state.blocks[postIndex],
          action.blockAction,
        )
      }
      return {
        ...state,
        blocks: nextBlocks,
        // thread: {
        //   ...state.thread,
        //   posts: nextPosts,
        // },
      }
    }
    case 'add_block': {
      const activeBlockIndex = state.activeBlockIndex
      const blockType = action.blockType
      const nextBlocks = [...state.blocks]
      nextBlocks.splice(activeBlockIndex + 1, 0, {
        id: nanoid(),
        type: blockType,
        richtext: new RichText({text: ''}),
        shortenedGraphemeLength: 0,
        labels: [],
        embed: {
          quote: undefined,
          media: undefined,
          link: undefined,
        },
      })
      return {
        ...state,
        blocks: nextBlocks,
        // thread: {
        //   ...state.thread,
        //   posts: nextPosts,
        // },
      }
    }
    case 'remove_block': {
      if (state.blocks.length < 2) {
        return state
      }
      let nextActiveBlockIndex = state.activeBlockIndex
      const indexToRemove = state.blocks.findIndex(p => p.id === action.blockId)
      let nextBlocks = [...state.blocks]
      if (indexToRemove !== -1) {
        // const postToRemove = state.blocks[indexToRemove]
        // if (postToRemove.embed.media?.type === 'video') {
        //   postToRemove.embed.media.video.abortController.abort()
        // }
        nextBlocks.splice(indexToRemove, 1)
        nextActiveBlockIndex = Math.max(0, indexToRemove - 1)
      }
      return {
        ...state,
        activeBlockIndex: nextActiveBlockIndex,
        mutableNeedsFocusActive: true,
        blocks: nextBlocks,
        // thread: {
        //   ...state.thread,
        //   posts: nextPosts,
        // },
      }
    }
    case 'focus_block': {
      const nextActivePostIndex = state.blocks.findIndex(
        p => p.id === action.blockId,
      )
      if (nextActivePostIndex === -1) {
        return state
      }
      return {
        ...state,
        activeBlockIndex: nextActivePostIndex,
      }
    }
    case 'set_end_date': {
      return {
        ...state,
        endDate: action.date,
      }
    }
  }
}

function blockReducer(
  state: ProposalBlockType,
  action: BlockAction,
): ProposalBlockType {
  switch (action.type) {
    case 'update_richtext': {
      return {
        ...state,
        richtext: action.richtext,
        shortenedGraphemeLength: getShortenedLength(action.richtext),
      }
    }
    case 'update_labels': {
      return {
        ...state,
        labels: action.labels,
      }
    }
    case 'embed_add_images': {
      if (action.images.length === 0) {
        return state
      }
      const prevMedia = state.embed.media
      let nextMedia = prevMedia
      if (!prevMedia) {
        nextMedia = {
          type: 'images',
          images: action.images.slice(0, MAX_IMAGES),
        }
      } else if (prevMedia.type === 'images') {
        nextMedia = {
          ...prevMedia,
          images: [...prevMedia.images, ...action.images].slice(0, MAX_IMAGES),
        }
      }
      return {
        ...state,
        embed: {
          ...state.embed,
          media: nextMedia,
        },
      }
    }
    case 'embed_update_image': {
      const prevMedia = state.embed.media
      if (prevMedia?.type === 'images') {
        const updatedImage = action.image
        const nextMedia = {
          ...prevMedia,
          images: prevMedia.images.map(img => {
            if (img.source.id === updatedImage.source.id) {
              return updatedImage
            }
            return img
          }),
        }
        return {
          ...state,
          embed: {
            ...state.embed,
            media: nextMedia,
          },
        }
      }
      return state
    }
    case 'embed_remove_image': {
      const prevMedia = state.embed.media
      let nextLabels = state.labels
      if (prevMedia?.type === 'images') {
        const removedImage = action.image
        let nextMedia: ImagesMedia | undefined = {
          ...prevMedia,
          images: prevMedia.images.filter(img => {
            return img.source.id !== removedImage.source.id
          }),
        }
        if (nextMedia.images.length === 0) {
          nextMedia = undefined
          if (!state.embed.link) {
            nextLabels = []
          }
        }
        return {
          ...state,
          labels: nextLabels,
          embed: {
            ...state.embed,
            media: nextMedia,
          },
        }
      }
      return state
    }
    case 'embed_add_video': {
      const prevMedia = state.embed.media
      let nextMedia = prevMedia
      if (!prevMedia) {
        nextMedia = {
          type: 'video',
          video: createVideoState(action.asset),
        }
      }
      return {
        ...state,
        embed: {
          ...state.embed,
          media: nextMedia,
        },
      }
    }
    case 'embed_update_video': {
      const videoAction = action.videoAction
      const prevMedia = state.embed.media
      let nextMedia = prevMedia
      if (prevMedia?.type === 'video') {
        nextMedia = {
          ...prevMedia,
          video: videoReducer(prevMedia.video, videoAction),
        }
      }
      return {
        ...state,
        embed: {
          ...state.embed,
          media: nextMedia,
        },
      }
    }
    case 'embed_remove_video': {
      const prevMedia = state.embed.media
      let nextMedia = prevMedia
      if (prevMedia?.type === 'video') {
        // prevMedia.video.abortController.abort()
        nextMedia = undefined
      }
      let nextLabels = state.labels
      if (!state.embed.link) {
        nextLabels = []
      }
      return {
        ...state,
        labels: nextLabels,
        embed: {
          ...state.embed,
          media: nextMedia,
        },
      }
    }
    case 'embed_add_uri': {
      const prevQuote = state.embed.quote
      const prevLink = state.embed.link
      let nextQuote = prevQuote
      let nextLink = prevLink
      // if (isBskyPostUrl(action.uri)) {
      //   if (!prevQuote) {
      //     nextQuote = {
      //       type: 'link',
      //       uri: action.uri,
      //     }
      //   }
      // } else {
      if (!prevLink) {
        nextLink = {
          type: 'link',
          uri: action.uri,
        }
      }
      // }
      return {
        ...state,
        embed: {
          ...state.embed,
          quote: nextQuote,
          link: nextLink,
        },
      }
    }
    case 'embed_remove_link': {
      let nextLabels = state.labels
      if (!state.embed.media) {
        nextLabels = []
      }
      return {
        ...state,
        labels: nextLabels,
        embed: {
          ...state.embed,
          link: undefined,
        },
      }
    }
    case 'embed_remove_quote': {
      return {
        ...state,
        embed: {
          ...state.embed,
          quote: undefined,
        },
      }
    }
    // case 'embed_add_gif': {
    //   const prevMedia = state.embed.media
    //   let nextMedia = prevMedia
    //   if (!prevMedia) {
    //     nextMedia = {
    //       type: 'gif',
    //       gif: action.gif,
    //       alt: '',
    //     }
    //   }
    //   return {
    //     ...state,
    //     embed: {
    //       ...state.embed,
    //       media: nextMedia,
    //     },
    //   }
    // }
    // case 'embed_update_gif': {
    //   const prevMedia = state.embed.media
    //   let nextMedia = prevMedia
    //   if (prevMedia?.type === 'gif') {
    //     nextMedia = {
    //       ...prevMedia,
    //       alt: action.alt,
    //     }
    //   }
    //   return {
    //     ...state,
    //     embed: {
    //       ...state.embed,
    //       media: nextMedia,
    //     },
    //   }
    // }
    // case 'embed_remove_gif': {
    //   const prevMedia = state.embed.media
    //   let nextMedia = prevMedia
    //   if (prevMedia?.type === 'gif') {
    //     nextMedia = undefined
    //   }
    //   return {
    //     ...state,
    //     embed: {
    //       ...state.embed,
    //       media: nextMedia,
    //     },
    //   }
    // }
  }
}

function getShortenedLength(rt: RichText) {
  return shortenLinks(rt).graphemeLength
}

export function createPoposalState(): ProposalState {
  const initRichText = new RichText({
    text: '',
  })
  return {
    activeBlockIndex: 0,
    mutableNeedsFocusActive: false,
    endDate: format(
      new Date(new Date().valueOf() + 3600 * 1000),
      'yyyy-MM-dd HH:mm:ss',
    ),
    blocks: [
      {
        id: nanoid(),
        shortenedGraphemeLength: getShortenedLength(initRichText),
        type: 'title',
        richtext: initRichText,
        labels: [],
        embed: {
          quote: undefined,
          media: undefined,
          link: undefined,
        },
      },
      {
        id: nanoid(),
        type: 'content',
        shortenedGraphemeLength: getShortenedLength(initRichText),
        richtext: initRichText,
        labels: [],
        embed: {
          quote: undefined,
          media: undefined,
          link: undefined,
        },
      },
    ],
  }
}
