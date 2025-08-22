import {type StyleProp, StyleSheet, View, type ViewStyle} from 'react-native'
import Animated, {type AnimatedStyle} from 'react-native-reanimated'
import {msg, plural} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import type React from 'react'

import {HITSLOP_10} from '#/lib/constants'
import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {useHaptics} from '#/lib/haptics'
import {useMinimalShellHeaderTransform} from '#/lib/hooks/useMinimalShellTransform'
import {colors} from '#/lib/styles'
import {emitSoftReset} from '#/state/events'
import {useUnreadNotifications} from '#/state/queries/notifications/unread'
import {useSession} from '#/state/session'
import {useShellLayout} from '#/state/shell/shell-layout'
import {Logo} from '#/view/icons/Logo'
import {atoms as a, useTheme} from '#/alf'
import {ButtonIcon} from '#/components/Button'
import {
  Bell_Filled_Corner0_Rounded as BellFilled,
  Bell_Stroke2_Corner0_Rounded as Bell,
} from '#/components/icons/Bell'
import {Hashtag_Stroke2_Corner0_Rounded as FeedsIcon} from '#/components/icons/Hashtag'
import * as Layout from '#/components/Layout'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'

export function HomeHeaderLayoutMobile({
  children,
  transparent,
  style,
}: {
  children?: React.ReactNode
  tabBarAnchor: JSX.Element | null | undefined
  transparent?: boolean
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}) {
  const t = useTheme()
  const {_} = useLingui()
  const {headerHeight} = useShellLayout()
  const headerMinimalShellTransform = useMinimalShellHeaderTransform()
  const {hasSession} = useSession()
  const playHaptic = useHaptics()
  const notificationCount = useUnreadNotifications()
  return (
    <Animated.View
      style={[
        a.fixed,
        a.z_10,
        !transparent ? t.atoms.bg : undefined,
        {
          top: 0,
          left: 0,
          right: 0,
        },
        headerMinimalShellTransform,
        ...(style || []),
      ]}
      onLayout={e => {
        headerHeight.set(e.nativeEvent.layout.height)
      }}>
      <Layout.Header.Outer noBottomBorder transparent={transparent}>
        <Layout.Header.Slot>
          <Layout.Header.MenuButton transparent={transparent} />
        </Layout.Header.Slot>

        <View style={[a.flex_1, a.align_center]}>
          <PressableScale
            targetScale={0.9}
            onPress={() => {
              emitSoftReset()
            }}
            onPressIn={() => {
              playHaptic('Heavy')
            }}
            onPressOut={() => {
              playHaptic('Light')
            }}>
            <Logo width={30} />
          </PressableScale>
        </View>

        <Layout.Header.Slot>
          {/* {hasSession && (
            <Link
              testID="viewHeaderHomeFeedPrefsBtn"
              to="/notifications"
              hitSlop={HITSLOP_10}
              label="通知"
              // size="large"
              variant={!transparent ? 'ghost' : undefined}
              color="secondary"
              // shape="square"
              style={[a.justify_end, styles.ctrl]}>
              <ButtonIcon icon={Bell} size="lg" color="#42576C" />
              {notificationCount ? (
                <View
                  style={[styles.dotBadge]}
                  aria-label={_(
                    msg`${plural(notificationCount, {
                      one: '# unread item',
                      other: '# unread items',
                    })}`,
                  )}>
                </View>
              ) : null}
            </Link>
          )} */}
        </Layout.Header.Slot>
      </Layout.Header.Outer>
      {children}
    </Animated.View>
  )
}

export const styles = StyleSheet.create({
  ctrl: {
    // flex: 1,
    // paddingTop: 6,
    // paddingBottom: 7,
    marginRight: -Layout.BUTTON_VISUAL_ALIGNMENT_OFFSET,
  },
  dotBadge: {
    position: 'absolute',
    top: -6,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#F66455',
    zIndex: 1,
  },
})
