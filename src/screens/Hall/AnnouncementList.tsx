import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import {parseFileComposeId} from '#/lib/extractAssetUrl'
import {type NavigationProp} from '#/lib/routes/types'
import {atoms as a, useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'
import server from '#/server'

export default function HallAnnouncementListScreen() {
  const t = useTheme()
  const navigation = useNavigation<NavigationProp>()

  const {data: announcements} = useRequest(async () =>
    server.dao('POST /information/page', {pageNum: 1, pageSize: 1000}),
  )

  return (
    <Layout.Screen testID="HallAnnouncementList">
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
                style={{width: 137, height: 137, top: 16, right: 18}}
                source={require('#/assets/hall/announcement.speaker.png')}
              />
            </View>
          </View>
          <View style={[styles.headPlaceholder, a.mb_lg]} />
          <View style={[a.px_lg]}>
            <Text style={[t.atoms.text, a.text_2xl, a.font_bold]}>公告栏</Text>
          </View>
          <View style={[a.px_lg, a.mt_md]}>
            <Text style={[t.atoms.text_contrast_low, a.text_sm]}>
              查看更多信息，了解内容
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          {announcements?.items?.map(annc => {
            return (
              <View
                key={annc.id}
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
                    style={{width: 16, height: 16}}
                    source={require('#/assets/hall/announcement.icon.svg')}
                  />
                </View>
                <View style={[a.flex_1]}>
                  <Text
                    style={[a.text_md, a.font_bold, a.leading_snug]}
                    numberOfLines={1}>
                    {annc.name}
                  </Text>
                </View>

                <Link
                  label={annc.name}
                  to={`/hall/announcement/${annc.id}`}
                  style={[styles.button]}>
                  <Text style={[t.atoms.text_contrast_medium]}>查看</Text>
                </Link>
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
