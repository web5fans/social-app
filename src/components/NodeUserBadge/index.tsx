import  {type FC} from 'react'
import {Pressable, type StyleProp, StyleSheet,Text, View} from 'react-native'
import {
  type DimensionValue,
  type ImageStyle,
} from 'react-native/Libraries/StyleSheet/StyleSheetTypes'
import {Image} from 'expo-image'
import {useRequest} from 'ahooks'

import {atoms as a} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import server from '#/server'

type NodeUserBadgeProps = {
  did: string
  size?: DimensionValue
  style?: StyleProp<ImageStyle>
}

const NodeUserBadge: FC<NodeUserBadgeProps> = props => {
  const {did, size = 16, style} = props

  const {data: nodeUsers = new Set<string>()} = useRequest(
    async () => {
      const list = (await server.dao('POST /user/node-user-list')) ?? []
      return new Set(list.map(u => u.did))
    },
    {
      cacheKey: 'node-user-list',
      cacheTime: 10 * 60 * 1000,
    },
  )

  const controls = Dialog.useDialogControl()

  if (!nodeUsers.has(did)) return null

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="节点用户"
        accessibilityHint="节点用户"
        onPress={() => controls.open()}>
        <Image
          accessibilityIgnoresInvertColors
          source={require('#/assets/node-user.svg')}
          style={[style, {width: size, height: size}]}
        />
      </Pressable>

      <Dialog.Outer control={controls} webOptions={{alignCenter: true}}>
        <Dialog.Handle />
        <Dialog.ScrollableInner label="节点用户认证" style={{width: 333}}>
          <Dialog.Close />
          <View>
            <Text style={S.title}>节点用户认证</Text>
          </View>
          <View style={S.content}>
            <Text style={S.description}>官方认证：此账户为节点用户</Text>
          </View>
          <View style={S.footer}>
            <Button
              label="确认"
              color="primary"
              variant="solid"
              style={S.btnConfirm}
              onPress={() => controls.close()}>
              <ButtonText>确认</ButtonText>
            </Button>
          </View>
        </Dialog.ScrollableInner>
      </Dialog.Outer>
    </>
  )
}

export default NodeUserBadge

const S = StyleSheet.create({
  title: {
    color: '#0B0F14',
    fontSize: 16,
    fontWeight: 800,
  },
  content: {
    marginTop: 26,
  },
  description: {
    color: '#42576C',
    fontSize: 14,
    fontWeight: 500,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 38,
  },
  btnConfirm: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
})
