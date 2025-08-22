import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import {parseFileComposeId} from '#/lib/extractAssetUrl'
import {type NavigationProp} from '#/lib/routes/types'
import {atoms as a, useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import server from '#/server'

export default function HallDocListScreen() {
  const t = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const {data: foundInfo} = useRequest(async () => {
    return server.dao('POST /global-config/foundation-info')
  })
  return (
    <Layout.Screen testID="HallDocList">
      <Layout.Center style={{flex: 1}}>
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
        <View style={[styles.headContainer, a.pb_4xl]}>
          <View style={styles.linearBg}>
            <View style={styles.headImage}>
              <Image
                accessibilityIgnoresInvertColors
                style={{width: 224, height: 224}}
                source={require('#/assets/hall/node-list.bg.png')}
              />
            </View>
          </View>
          <View style={[styles.headPlaceholder, a.mb_lg]} />
          <View style={[a.px_lg]}>
            <Text style={[t.atoms.text, a.text_2xl, a.font_bold]}>
              乡建DAO金库信息公开
            </Text>
          </View>
          <View style={[a.px_lg, a.mt_md]}>
            <Text style={[t.atoms.text_contrast_low, a.text_sm]}>
              查案更多信息，了解内容
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          {foundInfo?.foundationPublicDocument?.map(fileId => {
            const fileInfo = parseFileComposeId(fileId)
            if (!fileInfo) return null

            return (
              <View
                key={fileId}
                style={[
                  a.flex_row,
                  a.gap_sm,
                  a.px_lg,
                  a.py_xl,
                  a.align_center,
                  styles.item,
                ]}>
                <View style={[a.flex_0]}>
                  <Image
                    accessibilityIgnoresInvertColors
                    style={{width: 24, height: 24}}
                    source={require('#/assets/hall/doc.png')}
                  />
                </View>
                <View style={[a.flex_1]}>
                  <Text style={[a.text_md]}>{fileInfo.fileName}</Text>
                </View>
                <a
                  style={styles.link}
                  target="_blank"
                  href={fileInfo.url}
                  rel="noreferrer">
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.button]}
                    accessibilityIgnoresInvertColors>
                    <Text style={[t.atoms.text_contrast_medium]}>查看</Text>
                  </Pressable>
                </a>
              </View>
            )
          })}
        </View>
      </Layout.Center>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  headContainer: {
    position: 'relative',
  },
  link: {
    textDecorationLine: 'none',
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
  },
})
