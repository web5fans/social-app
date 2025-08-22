import React from 'react'
import {Dimensions, Linking, TouchableWithoutFeedback, View} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {type NavigationProp} from '#/lib/routes/types'
import {useSession} from '#/state/session'
import {type RenderTabBarFnProps} from '#/view/com/pager/Pager'
import {useBreakpoints} from '#/alf'
import * as Layout from '#/components/Layout'
import OssImage from '#/components/OssImage'
import server from '#/server'
import {TabBar} from '../pager/TabBar'
import {HomeHeaderLayout} from './HomeHeaderLayout'

const validateLink = (url: string) => {
  const link = url.match(/https?:\/\/(.*)/)
}

export function HomeHeader(
  props: RenderTabBarFnProps & {
    testID?: string
    onPressSelected: () => void
    feeds: {displayName: string; feedDescriptor: string}[]
  },
) {
  const {feeds} = props
  const {hasSession} = useSession()
  const navigation = useNavigation<NavigationProp>()
  const {gtMobile} = useBreakpoints()

  const {data: bannerList} = useRequest(() => server.dao('POST /banner/list'))

  const hasPinnedCustom = React.useMemo<boolean>(() => {
    if (!hasSession) return false
    return feeds.some(tab => {
      const isFollowing = tab.uri === 'following'
      return !isFollowing
    })
  }, [feeds, hasSession])

  const items = React.useMemo(() => {
    return feeds.map(f => f.displayName)
  }, [feeds])

  const onPressFeedsLink = React.useCallback(() => {
    navigation.navigate('Feeds')
  }, [navigation])

  const onSelect = React.useCallback(
    (index: number) => {
      // if (!hasPinnedCustom && index === items.length - 1) {
      //   onPressFeedsLink()
      // } else if (props.onSelect) {
      //   props.onSelect(index)
      // }
      props.onSelect?.(index)
    },
    [props], // items.length, , hasPinnedCustom
  )

  const screenWidth = gtMobile ? 600 : Dimensions.get('window').width

  const carouselHeight = screenWidth / (750 / 400)
  return (
    <>
      <HomeHeaderLayout tabBarAnchor={props.tabBarAnchor} />
      <Layout.Center>
        {!gtMobile && <View style={{height: 52}} />}
        <Carousel
          testID={'banner'}
          loop={true}
          width={screenWidth}
          height={carouselHeight}
          snapEnabled={true}
          pagingEnabled={true}
          autoPlayInterval={3000}
          autoPlay
          data={bannerList || []}
          style={{width: screenWidth}}
          onConfigurePanGesture={(g: {enabled: (arg0: boolean) => any}) => {
            'worklet'
            g.enabled(false)
          }}
          renderItem={({item, index}) => {
            return (
              <TouchableWithoutFeedback
                accessibilityRole={'link'}
                onPress={() => {
                  if (!item.linkAddress) return
                  const url = /https?:\/\/(.*)/.test(item.linkAddress)
                    ? item.linkAddress
                    : `//${item.linkAddress}`
                  Linking.openURL(url)
                }}>
                <img
                  src={extractAssetUrl(item.bannerFileId)}
                  style={{height: '100%'}}
                  draggable={false}
                />
              </TouchableWithoutFeedback>
            )
          }}
        />
      </Layout.Center>
      <Layout.Center
        style={{position: 'sticky', top: gtMobile ? 0 : 52, zIndex: 10}}>
        <TabBar
          key={'home-tab-bar'}
          onPressSelected={props.onPressSelected}
          selectedPage={props.selectedPage}
          onSelect={onSelect}
          testID={props.testID}
          items={items}
          dragProgress={props.dragProgress}
          dragState={props.dragState}
          border={false}
        />
      </Layout.Center>
    </>
  )
}
