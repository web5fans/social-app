import {useContext, useEffect, useRef, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'
import {useRequest} from 'ahooks'
import {format} from 'date-fns'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import MedalEmpty from '#/screens/MedalsWall/MedalEmpty'
import MedalsHeader from '#/screens/MedalsWall/MedalsHeader'
import {
  atoms as a,
  useBreakpoints,
  useLayoutBreakpoints,
  useTheme,
  web,
} from '#/alf'
import {useDialogContext} from '#/components/Dialog'
import * as Layout from '#/components/Layout'
import {CENTER_COLUMN_OFFSET, SCROLLBAR_OFFSET} from '#/components/Layout'
import {ScrollbarOffsetContext} from '#/components/Layout/context'
import OssImage from '#/components/OssImage'
import {Text} from '#/components/Typography'
import server from '#/server'
import BottomView from './BottomView'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'MedalsWall'>

const MedalsWallScreen = ({route}: Props) => {
  const {name} = route.params
  const t = useTheme()
  const {gtMobile} = useBreakpoints()
  const contentRef = useRef<HTMLDivElement | undefined>(undefined)
  const [headerOpacity, setHeaderOpacity] = useState(0)
  const {data: userMedals} = useRequest(async () => {
    const result = await server.dao('POST /user-medal/page', {
      pageNum: 1,
      pageSize: 500,
      domainName: name,
    })
    const received = result?.items.filter(m => !!m.getTime)
    return {
      received,
      receivedTotal: received?.length,
      medals: result?.items,
    }
  })

  useEffect(() => {
    const f = () => {
      const top = contentRef.current?.getBoundingClientRect().top
      setHeaderOpacity(top === 44 ? 1 : 0)
    }
    window.addEventListener('scroll', f)
    return () => {
      window.removeEventListener('scroll', f)
    }
  }, [])

  const isEmpty = userMedals?.medals?.length === 0

  const placeHolderHeight = 285 + 48

  const {isWithinOffsetView} = useContext(ScrollbarOffsetContext)
  const {centerColumnOffset} = useLayoutBreakpoints()
  const {isWithinDialog} = useDialogContext()

  return (
    <Layout.Screen testID="MedalsWallScreen">
      <View
        style={[
          a.w_full,
          a.mx_auto,
          gtMobile && {
            maxWidth: 600,
          },
          !isWithinOffsetView && {
            position: 'relative',
            left:
              centerColumnOffset && !isWithinDialog ? CENTER_COLUMN_OFFSET : 0,
          },
        ]}>
        <View
          style={{
            height: gtMobile ? placeHolderHeight + 80 : placeHolderHeight,
          }}
        />
        <MedalsHeader
          list={userMedals?.received}
          total={userMedals?.receivedTotal}
        />
        <View style={styles.content}>
          <View
            style={[
              styles.content_top_wrap,
              a.sticky,
              {backgroundColor: `rgba(53,53,68, ${headerOpacity})`},
            ]}
            ref={contentRef}>
            <View style={[styles.content_top]}>
              <Text style={[styles.content_title, t.atoms.text_contrast_high]}>
                勋章
              </Text>
            </View>
          </View>
          <View style={styles.content_inner}>
            <View style={styles.inner}>
              {isEmpty ? (
                <MedalEmpty />
              ) : (
                <View style={[styles.inner_grid]}>
                  {userMedals?.medals?.map(md => {
                    return (
                      <View style={styles.medal_item} key={md.medalId}>
                        <OssImage
                          attachId={md.attachId}
                          style={{
                            width: 80,
                            aspectRatio: 1,
                            filter: !md.getTime ? 'grayscale(100%)' : '',
                          }}
                        />
                        <Text
                          style={[
                            styles.medal_item_title,
                            t.atoms.text_contrast_high,
                          ]}>
                          {md.name}
                        </Text>
                        <Text
                          style={[
                            styles.medal_item_time,
                            t.atoms.text_contrast_low,
                          ]}>
                          {md.getTime
                            ? `${format(
                                new Date(md.getTime),
                                'yyyy.MM.dd',
                              )} 获得`
                            : '未获得'}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
            {!isEmpty && <BottomView />}
          </View>
        </View>
      </View>
    </Layout.Screen>
  )
}

export default MedalsWallScreen

const styles = StyleSheet.create({
  content: {
    marginTop: -48,
  },
  content_top_wrap: {
    top: 44,
    zIndex: 100,
  },
  content_top: {
    backgroundColor: '#F1F3F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content_inner: {
    backgroundColor: '#F1F3F5',
    paddingInline: 16,
    position: 'relative',
    minHeight: 'calc(100vh - 285px - 48px)',
  },
  content_title: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 20,
    textAlign: 'center',
    marginBlock: 14,
  },
  inner: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingBlock: 20,
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    minHeight: 'calc(100% - 50px)',
  },
  inner_grid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  medal_item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal_item_title: {
    fontSize: 14,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 3,
  },
  medal_item_time: {
    fontSize: 10,
    lineHeight: 14,
  },
})
