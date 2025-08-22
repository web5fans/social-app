import {type ComponentProps} from 'react'
import {StyleSheet, type TouchableWithoutFeedback, View} from 'react-native'
import Animated from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {Image} from 'expo-image'
import {LinearGradient} from 'expo-linear-gradient'

import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {useHaptics} from '#/lib/haptics'
import {useMinimalShellFabTransform} from '#/lib/hooks/useMinimalShellTransform'
import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {clamp} from '#/lib/numbers'
import {gradients} from '#/lib/styles'
import {isWeb} from '#/platform/detection'
import {atoms as a, useBreakpoints} from '#/alf'
import {Text} from '../Typography'

export type ProposalAffixTriggerProps = ComponentProps<
  typeof TouchableWithoutFeedback
> & {
  testID?: string
  affixLeft?: number
}

export default function ProposalAffixTrigger(props: ProposalAffixTriggerProps) {
  const {onPress, testID, ...restProps} = props
  const insets = useSafeAreaInsets()
  // const { isMobile, isTablet } = useWebMediaQueries()
  const playHaptic = useHaptics()
  const fabMinimalShellTransform = useMinimalShellFabTransform()
  const {gtMobile} = useBreakpoints()

  const size = styles.sizeRegular //  isTablet ? styles.sizeLarge : styles.sizeRegular

  // const tabletSpacing = isTablet
  //   ? { right: 50, bottom: 50 }
  //   : { right: 24, bottom: clamp(insets.bottom, 15, 60) + 15 }
  const tabletSpacing = {
    right: 24,
    bottom: clamp(insets.bottom, 15, 60) + 15,
  }

  return (
    <Animated.View
      style={[
        styles.outer,
        size,
        tabletSpacing,
        fabMinimalShellTransform, // isMobile &&
        gtMobile && {left: props.affixLeft},
      ]}>
      <PressableScale
        accessibilityIgnoresInvertColors
        testID={testID}
        // onPressIn={ios(() => playHaptic('Light'))}
        onPress={evt => {
          onPress?.(evt)
          playHaptic('Light')
        }}
        // onLongPress={ios((evt: any) => {
        //   onPress?.(evt)
        //   playHaptic('Heavy')
        // })}
        targetScale={0.9}
        {...restProps}>
        <LinearGradient
          colors={[gradients.blueLight.start, gradients.blueLight.end]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.inner, size]}>
          <Image
            style={{width: 22, height: 22}}
            source={require('#/assets/hall/write.svg')}
          />
          <Text style={[{color: '#fff'}]}>提案</Text>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  sizeRegular: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sizeLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  outer: {
    // @ts-ignore web-only
    position: isWeb ? 'fixed' : 'absolute',
    zIndex: 20,
    cursor: 'pointer',
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
})
