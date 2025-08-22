import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {type NavigationProp} from '#/lib/routes/types'
import {atoms as a, useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import server from '#/server'
import NodeInfo from './components/NodeInfo'

export default function HallNodeListScreen() {
  const navigation = useNavigation<NavigationProp>()
  const t = useTheme()
  const {data: nodeList} = useRequest(async () => {
    const res = await server.dao('POST /node/list')
    return res
  })
  return (
    <Layout.Screen testID="HallNodeList">
      <Layout.Center>
        <Pressable
          accessibilityRole="button"
          accessibilityIgnoresInvertColors
          style={{position: 'absolute', left: 16, top: 18, zIndex: 1}}
          onPress={() =>
            !navigation.canGoBack()
              ? navigation.push('Hall')
              : navigation.goBack()
          }>
          <Image
            accessibilityIgnoresInvertColors
            style={{width: 14, height: 12}}
            source={require('#/assets/arrow-left.svg')}
          />
        </Pressable>
        <View style={[styles.headContainer, a.pb_lg]}>
          <View style={styles.linearBg} />
          <View style={[styles.headPlaceholder, a.mb_lg]} />
          <View style={[a.px_lg]}>
            <Text style={[t.atoms.text, a.text_2xl, a.font_bold]}>节点</Text>
          </View>
        </View>

        <View style={styles.card}>
          {nodeList?.map(node => (
            <View
              key={node.nodeId}
              style={[
                a.flex_row,
                a.gap_sm,
                a.px_lg,
                a.py_xl,
                a.align_center,
                styles.item,
              ]}>
              <View
                style={[
                  a.flex_0,
                  a.rounded_full,
                  {width: 44, height: 44, overflow: 'hidden'},
                ]}>
                <Image
                  accessibilityIgnoresInvertColors
                  style={{width: '100%', height: '100%'}}
                  source={{
                    uri: extractAssetUrl(node.logo),
                  }}
                />
              </View>
              <View style={[a.flex_1]}>
                <Text style={[a.text_md]}>{node.name}</Text>
              </View>
              <NodeInfo
                node={node}
                trigger={
                  <View
                    style={[styles.button]}
                    accessibilityIgnoresInvertColors>
                    <Text style={[t.atoms.text_contrast_medium]}>查看</Text>
                  </View>
                }
              />
            </View>
          ))}
        </View>
      </Layout.Center>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  headContainer: {
    position: 'relative',
  },
  headImage: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  linearBg: {
    position: 'absolute',
    zIndex: 0,
    width: '100%',
    // height: '100%',
    paddingBottom: '66.5%',

    opacity: 0.6,
    backgroundImage:
      'linear-gradient(71deg, #DEF2FE 10.27%, #B5D3FF 28.82%, #D9D7FA 96.02%)',
  },

  headPlaceholder: {
    height: 52,
  },

  card: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#fff',
    // backgroundImage: "linear-gradient(180deg, #F3F9FE 0%, #FBFDFF 100%)",
    backgroundColor: '#F3F9FE',
    paddingBlock: 18,
    paddingInline: 16,
  },
  item: {
    width: '100%',
    // height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#F1F3F5',
    borderRadius: 15,
    paddingInline: 12,
    paddingBlock: 8,
    cursor: 'pointer',
  },
})
