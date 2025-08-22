import {type AppBskyFeedDefs, BlobRef, type BskyAgent} from '@atproto/api'

import proxyRequest from '#/lib/proxyRequest'
import server from '#/server'
import {defineProxyAPI} from '#/server/dao/defineAPI'
import {type ProposalStatus} from '#/server/dao/enums'
import {type FeedAPI, type FeedAPIResponse} from './types'

type RequestParams = {
  tag?: string // 类别，正文中的 `#任务`
  repo?: string // 用户did
  filter?: 'reply' | 'media' | string // 回复或媒体类型[reply, media]
  useAuth?: boolean
}

type FetchPostsParams = {
  pageNum: number
  pageSize: number
  params?: any
  useAuth?: boolean
}

async function fetchPosts({
  pageNum,
  pageSize,
  params,
  useAuth,
}: FetchPostsParams) {
  const result = await proxyRequest(
    '/post/api/posts',
    'POST',
    {
      page: pageNum,
      per_page: pageSize,
      ...(params || {}),
    },
    useAuth,
  )
  return {
    ...result,
    items: result?.posts?.map(restructFeedItem),
  }
}

export class PostsFeedAPI implements FeedAPI {
  agent: BskyAgent
  params: Omit<RequestParams, 'useAuth'>
  useAuth: boolean

  constructor({agent, params}: {agent: BskyAgent; params: RequestParams}) {
    this.agent = agent
    const {useAuth = false, ...obj} = params
    this.params = obj
    this.useAuth = useAuth
  }

  async peekLatest() {
    // if (did) {
    //   const items = await fetchMyProposal(+state)
    //   return items?.[0] ?? null
    // }
    const res = await fetchPosts({
      pageNum: 1,
      pageSize: 1,
      params: this.params,
      useAuth: this.useAuth,
    })
    return res?.items?.[0] || null
  }

  async fetch({cursor, limit}: {cursor: string | undefined; limit: number}) {
    const page = cursor ? +cursor : 1
    const res = await fetchPosts({
      pageNum: page,
      pageSize: limit,
      params: this.params,
      useAuth: this.useAuth,
    })
    if (res?.items) {
      return {
        cursor: `${res.page * res.per_page > res.total ? '' : res.page + 1}`,
        feed: res.items,
      }
    }
    return {
      feed: [],
    }
  }
}

function structImageBlobRef(imgList: any[]) {
  imgList.forEach(item => {
    item.image = new BlobRef(
      item.image.ref,
      item.image.mimeType,
      item.image.size,
      item.image.image,
    )
  })
}

export function structPostInfos(post: AppBskyFeedDefs.PostView) {
  structRecordText(post.record)
  structRecordText(post.embed?.record?.value)
  structRecordText(post.embed?.record?.record?.value)
  structPostImages(post)
}

function structRecordText(record: any) {
  if (record?.text && record?.text.length > 300) {
    record.realText = record.text
    record.text = record.text.substring(0, 300)
  }
}

function structPostImages(post: AppBskyFeedDefs.PostView) {
  if (post.record?.embed?.images) {
    structImageBlobRef(post.record.embed?.images)
  }

  if (post.record?.embed?.media?.images) {
    structImageBlobRef(post.record?.embed?.media?.images)
  }

  if (post.embed?.record?.value?.embed?.images) {
    structImageBlobRef(post.embed?.record?.value?.embed?.images)
  }
  if (post.embed?.record?.value?.embed?.media?.images) {
    structImageBlobRef(post.embed?.record?.value?.embed?.media?.images)
  }

  if (post.embed?.record?.record?.value?.embed?.images) {
    structImageBlobRef(post.embed?.record?.record?.value?.embed?.images)
  }
  if (post.embed?.record?.record?.value?.embed?.media?.images) {
    structImageBlobRef(post.embed?.record?.record?.value?.embed?.media?.images)
  }
}

export function reFillRecordText(post: AppBskyFeedDefs.PostView) {
  if (post.record.realText) {
    post.record.text = post.record.realText
  }
  if (post.reply?.parent?.record?.realText) {
    post.reply.parent.record.text = post.reply?.parent?.record.realText
  }
  if (post.reply?.root?.record?.realText) {
    post.reply.root.record.text = post.reply?.root?.record.realText
  }
  if (post.embed?.record?.value?.realText) {
    post.embed.record.value.text = post.embed?.record?.value.realText
  }
  if (post.embed?.record?.record?.value.realText) {
    post.embed.record.record.value.text =
      post.embed?.record?.record?.value.realText
  }
}

function restructFeedItem(
  item: AppBskyFeedDefs.FeedViewPost,
): AppBskyFeedDefs.FeedViewPost {
  const newItem = {...item}
  const post = {...newItem.post}
  const reply = newItem.reply

  if (reply) {
    reply.parent.$type = 'app.bsky.feed.defs#postView'
    reply.root.$type = 'app.bsky.feed.defs#postView'
    post.record.reply = {
      parent: {
        cid: reply.parent.cid,
        uri: reply.parent.uri,
      },
      root: {
        cid: reply.root.cid,
        uri: reply.root.uri,
      },
    }

    if (reply.parent) {
      structPostInfos(reply.parent)
    }

    if (reply.root) {
      structPostInfos(reply.root)
    }

    newItem.reply = reply
  }

  structPostInfos(post)

  newItem.post = post
  return newItem
}
