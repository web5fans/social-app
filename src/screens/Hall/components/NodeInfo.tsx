import {type ReactNode} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'

import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {atoms as a, useBreakpoints} from '#/alf'
import * as Dialog from '#/components/Dialog'
import Popup from '#/components/Popup'
import {Text} from '#/components/Typography'
type NodeInfoProps = {
  trigger: ReactNode
  node: APIDao.WebEndpointsNodeNodeListVo
}

export default function NodeInfo({trigger, node}: NodeInfoProps) {
  const {gtMobile} = useBreakpoints()
  return gtMobile ? (
    <TabletModal trigger={trigger} node={node} />
  ) : (
    <MobilePopup trigger={trigger} node={node} />
  )
}

function MobilePopup({trigger, node}: NodeInfoProps) {
  return (
    <Popup trigger={trigger} height={'80vh'}>
      <View style={[a.p_lg]}>
        <View style={[a.py_xs]}>
          <Text style={[a.text_lg, a.font_bold]}>节点</Text>
        </View>
        <View style={[a.flex_row, a.align_center, a.gap_xl, a.mt_2xl]}>
          <Image
            accessibilityIgnoresInvertColors
            style={[styles.logo]}
            source={{
              uri: extractAssetUrl(node.logo),
            }}
            alt=""
          />
          <View style={[a.flex, a.flex_col, a.gap_lg]}>
            <Text style={[a.text_2xl]}>{node.name}</Text>
            <Text style={[a.text_sm]}>当前稻米: {node.score ?? 0}</Text>
          </View>
        </View>
        <View style={[a.my_xl, styles.spliter]} />
        <Text style={[a.text_md, {lineHeight: 1.5}]}>{node.description}</Text>
      </View>
    </Popup>
  )
}

function TabletModal({trigger, node}: NodeInfoProps) {
  const controls = Dialog.useDialogControl()

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => controls.open()}>
        {trigger}
      </Pressable>
      <Dialog.Outer control={controls}>
        <Dialog.Handle />
        <Dialog.ScrollableInner label="节点信息" style={{width: 600}}>
          <Dialog.Close />
          <View style={[a.gap_lg]}>
            <Text style={[a.text_xl, a.font_heavy]}>节点介绍</Text>
          </View>
          <View style={[a.my_xl, styles.spliter]} />
          <View
            style={[a.flex_row, a.align_center, a.gap_xl, a.mt_md, a.mb_lg]}>
            <Image
              accessibilityIgnoresInvertColors
              style={[styles.logo]}
              source={{
                uri: extractAssetUrl(node.logo),
              }}
              alt=""
            />
            <View style={[a.flex, a.flex_col, a.gap_lg]}>
              <Text style={[a.text_2xl]}>{node.name}</Text>
              <Text style={[a.text_sm]}>当前稻米: {node.score ?? 0}</Text>
            </View>
          </View>
          <Text style={[a.text_md, {lineHeight: 1.5}]}>{node.description}</Text>
        </Dialog.ScrollableInner>
      </Dialog.Outer>
    </>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
    borderRadius: '50%',
  },
  spliter: {
    height: 1,
    width: '100%',
    backgroundColor: '#d4dbe2',
  },
})
