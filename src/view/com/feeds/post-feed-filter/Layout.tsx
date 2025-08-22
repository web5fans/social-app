import  {type ReactNode} from 'react'
import {StyleSheet, View} from 'react-native'

import * as Layout from '#/components/Layout'

type Props = {
  children?: ReactNode
  hasFilter?: boolean
}

export function PostFeedFilterLayout(props: Props) {
  const {hasFilter = false, children} = props

  return (
    <Layout.Center>
      {hasFilter ? children : <View style={S.divider} />}
    </Layout.Center>
  )
}

const S = StyleSheet.create({
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#D4DBE2',
  },
})
