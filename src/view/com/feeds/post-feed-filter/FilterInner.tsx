import 'antd-mobile/es/global'
import '@ant-design/v5-patch-for-react-19'

import {isNative} from '#/platform/detection'

import {StyleSheet, View} from 'react-native'
import {IndexedAtField} from './fields/indexed-at'
import {RepoField} from './fields/repo'

type Props = {}


export function PostFeedFilterInner(props: Props) {
  if (isNative) return null

  return (
    <View style={S.container}>
      <IndexedAtField />
      <RepoField />
    </View>
  )
}

const S = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D4DBE2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
