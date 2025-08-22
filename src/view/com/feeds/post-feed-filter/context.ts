import dayjs from 'dayjs'
import {createContext} from 'react'

export type ContextState = {
  tabName: string
  fields: {
    repo?: APIDao.WebEndpointsNodeNodeListVo,
    indexed_at?: {
      activeKey: string
      value: [dayjs.Dayjs, dayjs.Dayjs]
    }
  }
}

export type ContextActions = {
  setField: <F extends keyof ContextState['fields']>(filed: F, value: ContextState['fields'][F]) => void
}

export type PostFeedFilterContext = ContextState & ContextActions

const defaultState: PostFeedFilterContext = {
  tabName: "",
  fields: {},
  setField: () => void 0
}

export const PostFeedFilterContext =
  createContext<PostFeedFilterContext>(defaultState)
