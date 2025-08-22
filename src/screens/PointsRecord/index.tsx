import {useRef} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {useInfiniteScroll, useRequest} from 'ahooks'
import {format} from 'date-fns'

import displayNumber from '#/lib/displayNumber'
import {useGoBack} from '#/lib/hooks/useGoBack'
import PointsEmpty from '#/screens/PointsRecord/PointsEmpty'
import {atoms as a, useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import server from '#/server'

type InfiniteScrollType = {
  list: APIDao.WebEndpointsScoreUserScoreRecordPageVo[]
  total: number
  curPage: number
}

const PAGE_SIZE = 30

const PointsRecordScreen = () => {
  const t = useTheme()
  const goBack = useGoBack()

  const ref = useRef(null)

  const {data: userDetail} = useRequest(() =>
    server.dao('POST /user/login-user-detail'),
  )

  const {
    data: pointsRecord,
    loading,
    loadMore,
    loadingMore,
  } = useInfiniteScroll<InfiniteScrollType>(
    async d => {
      const page = d ? d.curPage + 1 : 1
      return await getPoints(page, d)
    },
    {
      target: ref,
      isNoMore: d => d?.list?.length === d?.total,
    },
  )

  const getPoints = async (page: number, d?: InfiniteScrollType) => {
    const result = await server.dao('POST /score/user-sore-record-page', {
      pageNum: page,
      pageSize: PAGE_SIZE,
    })

    return {
      list: (d?.list || []).concat(result?.items || []),
      total: result?.total || 0,
      curPage: (result?.pageIndex || 0) + 1,
    }
  }

  return (
    <Layout.Screen testID="PointsRecordScreen">
      <Layout.Center style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityIgnoresInvertColors
          style={{position: 'absolute', left: 16, top: 18, zIndex: 1}}
          onPress={goBack}>
          <Image
            accessibilityIgnoresInvertColors
            style={{width: 14, height: 12}}
            source={require('#/assets/arrow-left.svg')}
          />
        </Pressable>

        <View style={[styles.headContainer, a.pb_lg]}>
          <View style={styles.headImage}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: '100%', height: 346}}
              source={require('#/assets/points/bg.png')}
            />
          </View>
          <View style={[styles.headPlaceholder, a.mb_lg]} />
          <View style={[a.px_lg]}>
            <Text style={[t.atoms.text_contrast_low, a.text_sm]}>我的稻米</Text>
          </View>
          <View style={[a.px_lg, a.mt_md]}>
            <Text
              style={[
                t.atoms.text,
                a.text_4xl,
                a.text_family_ddin,
                a.font_bold,
              ]}>
              {displayNumber(userDetail?.score)}
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={[{fontWeight: 500, color: '#0B0F14', marginBottom: 18}]}>
            明细
          </Text>
          <View style={[styles.card_content, a.overflow_auto]} ref={ref}>
            {pointsRecord?.list.length === 0 ? (
              <PointsEmpty />
            ) : (
              pointsRecord?.list.map((p, index) => {
                const isPositive = p.score > 0
                return (
                  <View
                    key={p.id}
                    style={[
                      a.flex_row,
                      a.justify_between,
                      a.px_lg,
                      a.align_center,
                      styles.item,
                    ]}>
                    <View style={[a.flex_col, a.justify_between, a.gap_sm]}>
                      <Text
                        style={[
                          a.text_md,
                          a.font_bold,
                          t.atoms.text_contrast_high,
                        ]}>
                        {p.reason}
                      </Text>
                      <Text style={[t.atoms.text_contrast_high]}>
                        {
                          {
                            0: '',
                            1: '打赏',
                            2: '赠送',
                            3: '后台发放',
                          }[p.type]
                        }
                      </Text>
                      <Text style={[t.atoms.text_contrast_low]}>
                        {format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </Text>
                    </View>
                    <Text
                      style={[
                        a.text_md,
                        a.text_family_ddin,
                        a.font_bold,
                        isPositive ? {color: '#F66455'} : {color: '#37D28C'},
                      ]}>
                      {isPositive ? `+${p.score}` : p.score}
                    </Text>
                  </View>
                )
              })
            )}
          </View>
        </View>
      </Layout.Center>
    </Layout.Screen>
  )
}

export default PointsRecordScreen

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  headContainer: {
    position: 'relative',
    height: 150,
  },
  headImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
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
    borderColor: '#F1F3F5',
    backgroundImage: 'linear-gradient(180deg, #F3F9FE 0%, #FBFDFF 100%)',
    paddingBlock: 18,
    paddingInline: 16,
  },
  card_content: {
    height: 'calc(100% - 50px)',
  },
  item: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingBlock: 10,
  },
  button: {
    backgroundColor: '#F1F3F5',
    borderRadius: 15,
    paddingInline: 12,
    paddingBlock: 6,
  },
})
