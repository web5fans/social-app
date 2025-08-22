import {useSetState} from 'ahooks'
import {useEffect} from 'react'
import {type ContextState, PostFeedFilterContext} from './context'
import {PostFeedFilterInner} from './FilterInner'
import {PostFeedFilterLayout} from './Layout'

type Props = {
  feed: string
  value?: Fields
  onChange?: (value: Fields) => void
}

export type Fields = {
  indexed_at?: [string, string]
  repo?: string
}

const feed2TabName: Record<string, string> = {
  tasks: '任务',
  products: '商品',
}

const hasFilter = (feed: string) => {
  return ['tasks', 'products'].includes(feed.split('|')[1])
}

export function PostFeedFilter(props: Props) {
  const {feed, onChange} = props

  const [fields, setFields] = useSetState<ContextState['fields']>({})

  const tabName = feed2TabName[feed.split('|')[1]] ?? ''

  useEffect(() => {
    onChange?.({
      repo: fields.repo?.userDid,
      indexed_at: fields.indexed_at?.value
        ? [
            fields.indexed_at.value[0].format('YYYY-MM-DD 00:00:00'),
            fields.indexed_at.value[1].format('YYYY-MM-DD 23:59:59'),
          ]
        : undefined,
    })
  }, [onChange, fields.indexed_at?.value, fields.repo])

  return (
    <PostFeedFilterContext.Provider
      value={{
        tabName,
        fields,
        setField: (filed, value) => setFields({[filed]: value}),
      }}>
      <PostFeedFilterLayout hasFilter={hasFilter(feed)}>
        <PostFeedFilterInner />
      </PostFeedFilterLayout>
    </PostFeedFilterContext.Provider>
  )
}
