import {
  AppBskyFeedDefs,
  AppBskyFeedGetActorLikes as GetActorLikes, BlobRef,
  BskyAgent,
} from '@atproto/api'

import {FeedAPI, FeedAPIResponse} from './types'
import proxyRequest from "#/lib/proxyRequest";

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

async function fetchLikes({ pageNum, pageSize, params }: FetchPostsParams) {
  const result = await proxyRequest('/post/api/likes', 'POST', {
    page: pageNum,
    per_page: pageSize,
    ...(params || {})
  })
  return {
    ...result,
    items: result?.posts?.map(restructFeedItem),
  }
}

export class LikesFeedAPI implements FeedAPI {
  agent: BskyAgent
  params: Omit<RequestParams, 'useAuth'>
  useAuth: boolean

  constructor({agent, params}: {agent: BskyAgent; params: RequestParams}) {
    this.agent = agent
    const {useAuth = false, ...obj} = params;
    this.params = obj
    this.useAuth = useAuth
  }

  async peekLatest(): Promise<AppBskyFeedDefs.FeedViewPost> {
    const res = await fetchLikes({
      pageNum: 1,
      pageSize: 1,
      params: this.params,
      useAuth: this.useAuth,
    })
    return res?.items?.[0] || null
  }

  async fetch({
    cursor,
    limit,
  }: {
    cursor: string | undefined
    limit: number
  }): Promise<FeedAPIResponse> {
    const page = cursor ? +cursor : 1
    const res = await fetchLikes({
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

    newItem.reply = reply
  }

  if (post.record.embed?.images) {
    post.record.embed?.images.forEach(item => {
      item.image = new BlobRef(
        item.image.ref,
        item.image.mimeType,
        item.image.size,
        item.image,
      )
    })
  }

  newItem.post = post
  return newItem
}
