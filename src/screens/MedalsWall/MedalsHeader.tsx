import {useRef} from 'react'
import {Dimensions, Pressable, StyleSheet, View} from 'react-native'
import {useSharedValue} from 'react-native-reanimated'
import Carousel, {
  type ICarouselInstance,
} from 'react-native-reanimated-carousel'
import {Image} from 'expo-image'
import {gt} from 'lodash'

import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {useGoBack} from '#/lib/hooks/useGoBack'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import OssImage from '#/components/OssImage'
import {Text} from '#/components/Typography'

// const SCREEN_WIDTH = Dimensions.get("window").width;
const SCALE_RATIO = 240 / 750
const SCROLL_OFFSET_RATIO = 465 / 750
const SCREEN_WIDTH = Math.min(600, Dimensions.get('window').width)

const MedalsHeader = (props: {
  list?: APIDao.WebEndpointsUserMedalUserMedalPageVo[]
  total?: number
}) => {
  const {list = [], total = 0} = props
  const t = useTheme()
  const goBack = useGoBack()
  const {gtMobile} = useBreakpoints()
  const ref = useRef<ICarouselInstance>(null)
  const progress = useSharedValue<number>(0)

  const screenWidth = gtMobile ? 600 : Dimensions.get('window').width

  const fullWidth = gtMobile ? 600 : '100%'

  const carouselHeight = gtMobile ? 250 : 165

  const defaultHeight = 285 + 48

  const containerHeight = gtMobile ? defaultHeight + 50 : defaultHeight

  return (
    <>
      <View
        style={[
          a.fixed,
          a.top_0,
          a.z_10,
          {width: fullWidth, height: 44, overflow: 'hidden'},
        ]}>
        <View
          style={[
            styles.container,
            styles.bgColor,
            a.pl_lg,
            {paddingTop: 18, height: containerHeight},
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityIgnoresInvertColors
            onPress={goBack}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: 14, height: 12}}
              source={require('#/assets/arrow-left-white.svg')}
            />
          </Pressable>
        </View>
        <Image
          accessibilityIgnoresInvertColors
          style={[{width: 263, height: 253, top: 0}, styles.topBg]}
          source={require('#/assets/medals/light.png')}
        />
      </View>
      <View
        style={[
          styles.container,
          styles.bgColor,
          a.fixed,
          {width: fullWidth, height: containerHeight},
        ]}>
        <Image
          accessibilityIgnoresInvertColors
          style={[{width: 263, height: 253}, styles.topBg]}
          source={require('#/assets/medals/light.png')}
        />
        <Image
          accessibilityIgnoresInvertColors
          style={[{width: 209, height: 165, bottom: 11 + 48}, styles.topBg]}
          source={require('#/assets/medals/medal.png')}
        />
        <View style={[styles.header, a.gap_sm]}>
          <Image
            accessibilityIgnoresInvertColors
            style={[styles.wing]}
            source={require('#/assets/medals/wing.svg')}
          />
          <Text style={[a.text_xl, a.font_bold, t.atoms.text_inverted]}>
            总成就
            <Text style={[a.text_xl, a.font_bold, a.mx_sm, {color: '#1083FE'}]}>
              {total}
            </Text>
            枚
          </Text>
          <Image
            accessibilityIgnoresInvertColors
            style={[styles.wing, {transform: 'scaleX(-1)'}]}
            source={require('#/assets/medals/wing.svg')}
          />
        </View>
        <Text style={[styles.new_get, a.text_xs, a.mt_md, a.mb_sm]}>
          最新获得
        </Text>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: 60, aspectRatio: 1}}
              source={require('#/assets/medals/question.svg')}
            />
            <Text style={styles.emptyText}>待获得</Text>
          </View>
        ) : (
          <Carousel
            ref={ref}
            data={list}
            height={carouselHeight}
            loop={false}
            pagingEnabled={true}
            snapEnabled={true}
            width={SCREEN_WIDTH}
            mode="parallax"
            onProgressChange={progress}
            modeConfig={{
              parallaxScrollingOffset: SCROLL_OFFSET_RATIO * screenWidth,
              parallaxAdjacentItemScale: 0.15,
              parallaxScrollingScale: SCALE_RATIO,
            }}
            renderItem={({item, index}) => {
              const currentIndex = ref.current?.getCurrentIndex()
              return (
                <View style={[styles.swiper]}>
                  <img
                    src={extractAssetUrl(item.attachId)}
                    style={{width: '100%', aspectRatio: 1, userSelect: 'none'}}
                    draggable="false"
                  />
                  {index === currentIndex && (
                    <Text style={styles.swiper_text}>{item.name}</Text>
                  )}
                </View>
              )
            }}
          />
        )}
      </View>
    </>
  )
}

export default MedalsHeader

const styles = StyleSheet.create({
  bgColor: {
    backgroundImage: 'linear-gradient(180deg, #3A394A 0%, #1E1F23 100%)',
  },
  container: {
    top: 0,
  },
  topBg: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  header: {
    marginTop: 59,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wing: {
    width: 23,
    height: 14,
  },
  new_get: {
    color: '#959399',
    textAlign: 'center',
  },
  swiper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiper_text: {
    fontSize: 14 / SCALE_RATIO,
    fontWeight: 500,
    color: '#fff',
    marginTop: 23,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
    paddingTop: 45,
  },
  emptyText: {
    color: '#6F869F',
    fontSize: 14,
    fontWeight: 500,
  },
})
