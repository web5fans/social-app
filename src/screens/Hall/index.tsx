import {useCallback, useEffect, useRef, useState} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import Animated, {useAnimatedRef} from 'react-native-reanimated'
import {Image} from 'expo-image'
import {
  type NavigationProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import {useRequest} from 'ahooks'

import displayNumber from '#/lib/displayNumber'
import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {getRootNavigation, getTabState, TabState} from '#/lib/routes/helpers'
import {type AllNavigatorParams} from '#/lib/routes/types'
import {listenProposalCreated, listenSoftReset} from '#/state/events'
import {RQKEY as FEED_RQKEY} from '#/state/queries/post-feed'
import {truncateAndInvalidate} from '#/state/queries/util'
import {useSetMinimalShellMode} from '#/state/shell'
import {HomeHeaderLayoutMobile} from '#/view/com/home/HomeHeaderLayoutMobile'
import {type ListRef} from '#/view/com/util/List'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {Button} from '#/components/Button'
import ExpandRightIcon from '#/components/DAO/icons/expand-right'
import * as Layout from '#/components/Layout'
import {Link} from '#/components/Link'
import ProposalFormModal from '#/components/ProposalForm'
import {Text} from '#/components/Typography'
import server from '#/server'
import {ProposalStatus} from '#/server/dao/enums'
import {ProfileFeedSection} from '../Profile/Sections/Feed'
import {type SectionRef} from '../Profile/Sections/types'
import NodeInfo from './components/NodeInfo'

const proposalStageOptions: Array<{key: ProposalStatus; label: string}> = [
  {key: ProposalStatus.Unknown, label: '全部'},
  {key: ProposalStatus.InProgress, label: '进行中'},
  {key: ProposalStatus.Pass, label: '通过'},
  {key: ProposalStatus.Fail, label: '未通过'},
]

export default function HallScreen() {
  const t = useTheme()
  const [headerOpacity, setHeaderOpacity] = useState(0)
  const [currentTabKey, setTabKey] = useState(proposalStageOptions[0].key)
  const queryClient = useQueryClient()
  const navigation = useNavigation<NavigationProp<AllNavigatorParams>>()
  const {data: nodeList, run: reloadNodeList} = useRequest(async () => {
    const res = await server.dao('POST /node/list')
    return res
  })
  const {data: foundInfo, run: reloadFoundInfo} = useRequest(async () => {
    return server.dao('POST /global-config/foundation-info')
  })
  const scrollElRef = useAnimatedRef()
  const postsSectionRef = useRef<SectionRef>(null)
  const isPageFocused = true
  const route = useRoute()

  const [affixLeft, setAffixLeft] = useState(0)

  const {data: announcements} = useRequest(async () =>
    server.dao('POST /information/page', {pageNum: 1, pageSize: 3}),
  )

  useEffect(() => {
    if (!route) return
    reloadNodeList()
    reloadFoundInfo()
  }, [route, reloadNodeList, reloadFoundInfo])

  const setMinimalShellMode = useSetMinimalShellMode()
  useFocusEffect(
    useCallback(() => {
      setMinimalShellMode(false)
    }, [setMinimalShellMode]),
  )

  // const onProposalCreated = useCallback(() => {
  //   // NOTE
  //   // only invalidate if there's 1 page
  //   // more than 1 page can trigger some UI freakouts on iOS and android
  //   // -prf
  //   if (
  //     currentTabKey === ProposalStatus.Unknown ||
  //     currentTabKey === ProposalStatus.InProgress
  //   ) {
  //     queryClient.invalidateQueries({
  //       queryKey: FEED_RQKEY(`proposal|${currentTabKey}`),
  //     })
  //   }
  // }, [queryClient, currentTabKey])
  // useEffect(() => {
  //   return listenProposalCreated(onProposalCreated)
  // }, [onProposalCreated])

  const onSoftReset = useCallback(() => {
    const isScreenFocused =
      getTabState(getRootNavigation(navigation).getState(), 'Hall') ===
      TabState.InsideAtRoot
    if (isScreenFocused && isPageFocused) {
      postsSectionRef.current?.scrollToTop()
      // scrollToTop()
      truncateAndInvalidate(
        queryClient,
        FEED_RQKEY(`proposal|${currentTabKey}`),
      )
      // setHasNew(false)
      // logEvent('feed:refresh', {
      //   feedType: feed.split('|')[0],
      //   feedUrl: feed,
      //   reason: 'soft-reset',
      // })
    }
  }, [navigation, isPageFocused, queryClient, currentTabKey, postsSectionRef])

  useEffect(() => {
    if (!isPageFocused) {
      return
    }
    return listenSoftReset(onSoftReset)
  }, [onSoftReset, isPageFocused])

  useEffect(() => {
    const f = () => {
      const scrollY = window.scrollY
      const offset = 100
      const opacity =
        scrollY < offset
          ? 0
          : Math.max(
              0,
              Math.min(+((scrollY - offset) / (220 - offset)).toFixed(2), 1),
            )
      setHeaderOpacity(opacity)
    }
    window.addEventListener('scroll', f)
    return () => {
      window.removeEventListener('scroll', f)
    }
  }, [])

  return (
    <Layout.Screen testID="hallScreen">
      <HomeHeaderLayoutMobile
        tabBarAnchor={null}
        transparent
        style={[{backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`}]}
      />
      <Layout.Center
        onLayout={e => {
          const {layout} = e.nativeEvent
          const left = layout.width + layout.x + 28
          setAffixLeft(left)
        }}>
        <View style={styles.linearBg} />
        <View style={[a.flex_col, a.px_lg, a.flex_0, styles.topInfo]}>
          <View style={[a.flex_row, a.align_baseline, a.justify_between]}>
            <Text style={[t.atoms.text, a.text_2xl, a.font_bold]}>
              乡建DAO金库
            </Text>
            <Link
              label="文档列表"
              // accessibilityRole="button"
              // accessibilityIgnoresInvertColors
              // style={[a.flex_row]}
              // onPress={() => {
              //   navigation.push('HallDocList')
              // }}
              to="/hall/documents"
              style={{color: '#6F869F'}}>
              <Text
                style={[
                  t.atoms.text_contrast_medium,
                  a.text_sm,
                  {color: 'inherit'},
                ]}>
                更多
              </Text>
              <ExpandRightIcon size={14} />
            </Link>
          </View>
          <View style={[a.flex_row, a.gap_md, a.mt_xl]}>
            <View style={[a.flex_1, styles.foundCard, styles.foundScale]}>
              <Image
                accessibilityIgnoresInvertColors
                style={[styles.foundScaleBG]}
                source={require('#/assets/hall.cash.svg')}
              />
              <Text style={[t.atoms.text_inverted, a.text_md]}>金库规模</Text>
              <View style={[a.flex_row, a.gap_sm, a.align_baseline]}>
                <Text style={[t.atoms.text_inverted, a.text_2xl]}>¥</Text>
                <Text
                  style={[
                    t.atoms.text_inverted,
                    a.text_3xl,
                    a.text_family_ddin,
                    a.font_bold,
                  ]}>
                  {displayNumber(foundInfo?.fundScale)}
                </Text>
              </View>
            </View>
            <View style={[a.flex_1, styles.foundCard, styles.foundToken]}>
              <Image
                accessibilityIgnoresInvertColors
                style={[styles.foundTokenBG]}
                source={require('#/assets/hall.token.svg')}
              />
              <Text style={[t.atoms.text_inverted, a.text_md]}>已发行稻米</Text>
              <Text
                style={[
                  t.atoms.text_inverted,
                  a.text_3xl,
                  a.text_family_ddin,
                  a.font_bold,
                ]}>
                {displayNumber(foundInfo?.issuePointsScale)}
              </Text>
            </View>
          </View>
          <View style={[a.flex, a.flex_col, a.mt_xl, styles.announcement]}>
            <Image
              style={[styles.announcementBgImg]}
              accessibilityIgnoresInvertColors
              source={require('#/assets/hall/announcement.bg.svg')}
            />
            <View
              style={[
                a.flex,
                a.flex_row,
                a.align_center,
                a.justify_between,
                a.px_md,
                a.pt_xs,
              ]}>
              <View style={[a.flex, a.flex_row, a.align_end]}>
                <Image
                  style={[styles.announcementTitle]}
                  accessibilityIgnoresInvertColors
                  source={require('#/assets/hall/announcement.title.svg')}
                />
                <Text style={[styles.announcementInfo]}>INFORMATION</Text>
              </View>

              <Link
                label="公告列表"
                to="/hall/announcements"
                style={{color: 'white'}}>
                <Text
                  style={[
                    t.atoms.text_contrast_medium,
                    a.text_sm,
                    a.font_bold,
                    {color: 'inherit'},
                  ]}>
                  更多
                </Text>
                <ExpandRightIcon size={14} />
              </Link>
            </View>

            <View style={styles.announcementBox}>
              <View style={styles.announcementList}>
                {announcements?.items?.length === 0 && (
                  <View style={[a.flex, a.justify_center, a.align_center]}>
                    <Text style={[a.text_md, {color: '#42576C'}]}>
                      暂无公告
                    </Text>
                  </View>
                )}
                {announcements?.items?.map(item => (
                  <Link
                    key={item.id}
                    to={`/hall/announcement/${item.id}`}
                    label={item.title}
                    style={[a.w_full, {display: 'block', color: '#6F869F'}]}>
                    <View style={[styles.announcementItem, a.gap_sm]}>
                      <Image
                        style={[styles.announcementIcon]}
                        accessibilityIgnoresInvertColors
                        source={require('#/assets/hall/announcement.icon.svg')}
                      />
                      <View style={[a.flex_1]}>
                        <Text
                          style={[a.text_md, a.font_bold, {color: '#0B0F14'}]}
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <ExpandRightIcon size={14} />
                    </View>
                  </Link>
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.cardWrapper]}>
          <View style={[styles.card, a.pt_lg]}>
            <View
              style={[
                a.flex_row,
                a.align_baseline,
                a.justify_between,
                a.px_lg,
              ]}>
              <Text style={[t.atoms.text, a.text_lg, a.font_bold]}>节点</Text>
              {(nodeList?.length ?? 0) > 4 && (
                <Link
                  label="节点列表"
                  // accessibilityRole="button"
                  // accessibilityIgnoresInvertColors
                  // style={[a.flex_row]}
                  // onPress={() => {
                  //   navigation.push('HallNodeList')
                  // }}
                  to="/hall/nodes"
                  style={{color: '#6F869F'}}>
                  <Text
                    style={[
                      t.atoms.text_contrast_medium,
                      a.text_sm,
                      {color: 'inherit'},
                    ]}>
                    更多
                  </Text>
                  <ExpandRightIcon size={14} />
                  {/* <Image
                    style={{ width: 14, height: 14 }}
                    source={require('#/assets/expand-right.svg')}
                  /> */}
                </Link>
              )}
            </View>

            <View
              style={[
                a.flex_row,
                a.align_center,
                a.px_4xl,
                a.mt_lg,
                a.justify_between,
              ]}>
              {nodeList?.slice(0, 4).map(node => (
                <NodeInfo
                  key={node.nodeId}
                  node={node}
                  trigger={
                    <Image
                      source={{uri: extractAssetUrl(node.logo)}}
                      style={[
                        a.flex_0,
                        {
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'rgb(241, 243, 245)',
                        },
                      ]}
                    />
                  }
                />
              ))}
            </View>

            <View
              style={[
                a.sticky,
                a.pb_md,
                a.border_b,
                a.px_lg,
                t.atoms.border_contrast_low,
                {top: 22, zIndex: 9, backgroundColor: '#fff'},
              ]}>
              <View style={[{paddingTop: 30}]}>
                <Text style={[t.atoms.text, a.text_lg, a.font_bold]}>提案</Text>
              </View>
              <View style={[a.flex_row, a.mt_md, a.gap_md]}>
                {proposalStageOptions.map(({label, key}, idx) => {
                  return (
                    <Button
                      label={label}
                      key={key}
                      style={[
                        a.flex_0,
                        a.flex_col,
                        a.align_center,
                        a.justify_center,
                        styles.tab,
                        {color: '#42576C'},
                        currentTabKey === key ? styles.activeTab : undefined,
                      ]}
                      hoverStyle={[styles.activeTab]}
                      onPress={() => {
                        setTabKey(key)
                        postsSectionRef.current?.scrollToTop()
                      }}>
                      <Text
                        style={[
                          currentTabKey === key
                            ? styles.activeTabText
                            : undefined,
                          {color: 'inherit'},
                        ]}>
                        {label}
                      </Text>
                    </Button>
                  )
                })}
              </View>
            </View>
            <ProfileFeedSection
              emptyMessage="目前还没有提案"
              ref={postsSectionRef}
              // feed={`author|did:plc:pc5gxd5my6uooild5drcixdm|posts_and_author_threads`}
              feed={`proposal|${currentTabKey}`}
              // feed={`proposal|${currentTabKey}|did:plc:pc5gxd5my6uooild5drcixdm`}
              headerHeight={0}
              isFocused={true}
              contentContainerStyle={{
                minHeight: 'calc(100vh - 52px - 58px - 64px)',
              }}
              desktopFixedHeight={false}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={'did:plc:pc5gxd5my6uooild5drcixdm'}
              setScrollViewTag={() => null}
            />
            {/* <View style={[{ height: 2000, backgroundColor: '#f00' }]} /> */}

            {/* <Text>sdfagjlasjfal</Text> */}
            {/* <View style={[{ minHeight: 'calc(100vh - 52px - 58px - 20px)' }]}>
            <View style={[{ height: 2000 }]} />
          </View> */}
          </View>
        </View>
      </Layout.Center>
      <ProposalFormModal affixLeft={affixLeft} />
      {/* <View style={[a.flex_col, a.h_full, { paddingTop: 52 + 20, zIndex: 1, gap: 25, paddingBottom: 58 }]}>
        <View style={[styles.card, a.flex_1]}>
          <Text>sdfagjlasjfal</Text>
        </View>
      </View> */}
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  linearBg: {
    position: 'absolute',
    zIndex: 0,
    width: '100%',
    // height: '100%',
    paddingBottom: '100%',

    opacity: 0.6,
    backgroundImage:
      'linear-gradient(71deg, #DEF2FE 10.27%, #B5D3FF 28.82%, #D9D7FA 96.02%)',
  },
  topInfo: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    top: 52 + 20,
  },
  foundCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 19,
    borderRadius: 16,
    paddingTop: 30,
    paddingBottom: 20,
    minHeight: 130,
    paddingInline: 16,
  },
  foundScale: {
    backgroundImage: 'linear-gradient(126deg, #154FFF 16.58%, #68C3FD 93.61%)',
  },
  foundScaleBG: {
    position: 'absolute',
    width: 51,
    height: 61,
    right: 0,
    bottom: 0,
  },
  foundToken: {
    backgroundImage: 'linear-gradient(126deg, #6685FB 16.58%, #B2BEFF 93.61%)',
  },
  foundTokenBG: {
    position: 'absolute',
    width: 52,
    height: 60,
    right: 0,
    bottom: 0,
  },
  cardWrapper: {
    position: 'relative',
    marginTop: 90,
    bottom: 0,
    // left: '50%',
    // transform: 'translateX(-50%)',
    width: '100%',
    // height: '100%',
    // paddingTop: 220,
    paddingBottom: 58,
    zIndex: 2,
    pointerEvents: 'none',
    // overflow: 'auto'
  },
  cardHeader: {
    backgroundColor: '#f00',
    width: '100%',
    height: 20,
    top: 52,
    zIndex: 9,
    overflow: 'hidden',
  },
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // marginTop: 25,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    backgroundColor: '#fff',
    // overflow: 'hidden',
    pointerEvents: 'auto',
  },
  tab: {
    paddingBlock: 6,
    paddingInline: 12,
    // backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#D4DBE2',
    borderRadius: 15,
    cursor: 'pointer',
  },
  activeTab: {
    backgroundColor: '#0B0F14',
    borderColor: '#0B0F14',
    color: '#fff',
  },
  activeTabText: {color: '#fff'},
  // 公告栏
  announcement: {
    position: 'relative',
    width: '100%',
    padding: 6,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    backgroundImage: 'linear-gradient(80deg, #9DCBFF 1.37%, #DCCDFF 98.09%)',
  },
  announcementTitle: {
    width: 48,
    height: 15,
  },
  announcementInfo: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
    opacity: 0.5,
  },
  announcementBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: 'white',
    backgroundImage: 'linear-gradient(180deg, #F1F7FE 0%, #FFF 100%)',
  },
  announcementBgImg: {
    position: 'absolute',
    top: 0,
    right: 14,
    width: 80,
    height: 66,
  },
  announcementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  announcementItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    height: 20,
  },
  announcementIcon: {
    width: 16,
    height: 16,
  },
})
