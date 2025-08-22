import {useState} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import RenderHtml from 'react-native-render-html'
import {Image} from 'expo-image'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'
import dayjs from 'dayjs'

import {parseFileComposeId} from '#/lib/extractAssetUrl'
import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
  type NavigationProp,
} from '#/lib/routes/types'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import server from '#/server'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'HallAnnouncement'>

export default function HallAnnouncementScreen(props: Props) {
  const [width, setWidth] = useState(0)

  const id = props.route.params.id

  const navigation = useNavigation<NavigationProp>()
  const {data: annc} = useRequest(async () => {
    const detail = await server.dao('POST /information/detail', {
      informationId: id,
    })

    const {fileType, fileId} = parseFileComposeId(detail!.attachId)!
    const fileBlob = await server.dao(
      'GET /file/download',
      {fileId, fileType},
      {responseType: 'blob'},
    )
    const content = await fileBlob!.text()
    return {
      ...detail,
      content: content,
    }
  })

  return (
    <Layout.Screen testID="HallAnnouncement">
      <Layout.Center style={{flex: 1}}>
        <View style={styles.nav}>
          <Pressable
            accessibilityRole="button"
            accessibilityIgnoresInvertColors
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

          <Text style={styles.navTitle}>公告栏</Text>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.summary}>
            <Text style={styles.title}>{annc?.name}</Text>

            <View style={styles.postTime}>
              <Image
                accessibilityIgnoresInvertColors
                style={{width: 16, height: 16}}
                source={require('#/assets/clock.svg')}
              />
              <Text style={{fontSize: 12, color: '#6F869F'}}>
                {annc?.createAt
                  ? dayjs(annc?.createAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Text>
            </View>
          </View>

          <View
            onLayout={event => {
              setWidth(event.nativeEvent.layout.width)
            }}
            style={{paddingBottom: 60}}>
            <RenderHtml
              contentWidth={width}
              defaultTextProps={{selectable: true}}
              source={{
                html: annc?.content ?? '',
                baseUrl: global.window.location.origin,
              }}
              htmlParserOptions={{
                decodeEntities: true,
              }}
            />
          </View>
        </View>
      </Layout.Center>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  nav: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4DBE2',
    gap: 8,
  },
  navTitle: {
    color: '#0B0F14',
    fontSize: 16,
    fontWeight: 500,
  },
  contentWrap: {
    display: 'flex',
    gap: 10,
    padding: 16,
  },
  summary: {
    display: 'flex',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4DBE2',
    paddingBottom: 12,
  },
  title: {
    color: '#0B0F14',
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1.2,
  },
  postTime: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})
