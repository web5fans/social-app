import {type AppBskyFeedDefs, type BskyAgent} from '@atproto/api'

import {get} from '#/state/persisted'
import server from '#/server'
import {type ProposalStatus} from '#/server/dao/enums'
import {type FeedAPI, type FeedAPIResponse} from './types'

type RequestParams = {
  state: ProposalStatus
  did?: string
}

async function fetchMyProposal(
  type: APIDao.WebEndpointsProposalMyProposalReq['type'],
) {
  const items = await server.dao('POST /proposal/my-proposal-list', {type})
  return items?.map(restructFeedItem)
}

async function fetchProposal(
  status: ProposalStatus,
  pageNum: number,
  pageSize: number,
) {
  const session = get('session')
  const did = session.currentAccount?.did
  const res = await server.dao('POST /proposal/page', {
    status: +status,
    pageNum,
    pageSize,
    did,
  })
  return {
    ...res,
    items: res?.items?.map(restructFeedItem),
  }
}

export class ProposalFeedAPI implements FeedAPI {
  agent: BskyAgent
  params: RequestParams = {state: 0}
  constructor({params, agent}: {params: RequestParams; agent: BskyAgent}) {
    this.agent = agent
    this.params = params
  }

  async peekLatest() {
    const {state, did} = this.params
    if (did) {
      const items = await fetchMyProposal(+state)
      return items?.[0] ?? null
    }
    const res = await fetchProposal(state, 1, 1)
    return res?.items?.[0] || null
  }

  async fetch({cursor, limit}: {cursor: string | undefined; limit: number}) {
    const {state, did} = this.params
    const page = cursor ? +cursor : 1
    // console.log('proposal request params:', {state, did, page})

    if (did) {
      const items = await fetchMyProposal(+state)
      return {
        feed: items || [],
      }
    }

    const res = await fetchProposal(state, page, limit)
    if (res?.items) {
      return {
        cursor: `${
          res.pageIndex * res.pageSize > res.total ? '' : res.pageIndex + 1
        }`,
        feed: res.items,
      }
    }
    return {
      feed: [],
    }
  }
}

function restructFeedItem(
  item: APIDao.WebEndpointsProposalProposalPageVo,
): AppBskyFeedDefs.FeedViewPost {
  return {
    post: {
      ...item,
      cid: item.proposalId,
      author: {
        did: item.initiatorDid,
        displayName: item.initiatorName || item.initiatorDomainName,
        avatar: item.initiatorAvatar,
        handle: item.initiatorDomainName,
      },
      record: {
        $type: 'app.bsky.feed.post',
        text: item.name,
        createdAt: item.createdAt, // '2025-06-19T05:24:38.345Z',
        langs: ['zh'],
      },
      uri: `at://${item.initiatorId}/proposal/${item.proposalId}`,
      indexedAt: item.createdAt,
    },
  }
}
