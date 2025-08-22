import {
  cloneElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from 'react'
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native'
import {Image} from 'expo-image'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {RemoveScrollBar} from 'react-remove-scroll-bar'

import {useIntentHandler} from '#/lib/hooks/useIntentHandler'
import {colors} from '#/lib/styles'
import {useComposerKeyboardShortcut} from '#/state/shell/composer/useComposerKeyboardShortcut'
import {atoms as a, select, useTheme} from '#/alf'
import {Portal} from '../Portal'

type PopupProps = {
  children?: React.ReactNode
  onClose?: () => void
  trigger: React.ReactNode
  height: number | string
  zIndex?: number
  maskClosable?: boolean
}

export type PopupRef = {
  open: () => void
  close: () => void
}

const Popup = forwardRef<PopupRef, PopupProps>(function Popup(props, ref) {
  const {height, zIndex = 1000, maskClosable = true} = props
  const [popupVisible, setPopupVisible] = useState(false)
  const {_} = useLingui()
  const t = useTheme()
  const [showPopupDelayedExit, setShowPopupDelayedExit] = useState(popupVisible)

  useLayoutEffect(() => {
    if (popupVisible !== showPopupDelayedExit) {
      if (popupVisible) {
        setShowPopupDelayedExit(true)
      } else {
        const timeout = setTimeout(() => {
          setShowPopupDelayedExit(false)
        }, 160)
        return () => clearTimeout(timeout)
      }
    }
  }, [popupVisible, showPopupDelayedExit])

  useImperativeHandle(ref, () => {
    return {
      open: () => setPopupVisible(true),
      close: () => setPopupVisible(false),
    }
  })

  useComposerKeyboardShortcut()
  useIntentHandler()

  return (
    <>
      <TouchableWithoutFeedback
        accessibilityRole="button"
        onPress={() => setPopupVisible(true)}>
        {props.trigger}
      </TouchableWithoutFeedback>
      {showPopupDelayedExit && (
        <Portal>
          <RemoveScrollBar />
          <TouchableWithoutFeedback
            accessibilityIgnoresInvertColors
            onPress={ev => {
              // Only close if press happens outside of the drawer
              if (ev.target === ev.currentTarget) {
                maskClosable && setPopupVisible(false)
              }
            }}
            accessibilityLabel={_(msg`Close drawer menu`)}
            accessibilityHint="">
            <View
              style={[
                styles.drawerMask,
                {
                  backgroundColor: popupVisible
                    ? select(t.name, {
                        light: 'rgba(0, 0, 0, 0.7)',
                        dark: 'rgba(1, 82, 168, 0.1)',
                        dim: 'rgba(10, 13, 16, 0.8)',
                      })
                    : 'transparent',
                },
                a.transition_color,
                {zIndex},
              ]}>
              <View
                style={[
                  styles.drawerContainer,
                  popupVisible ? a.slide_in_bottom : a.slide_out_bottom,
                  {height},
                ]}>
                <TouchableWithoutFeedback
                  accessibilityRole="button"
                  onPress={() => setPopupVisible(false)}>
                  <Image
                    style={[styles.closeIcon]}
                    source={require('#/assets/close.svg')}
                  />
                </TouchableWithoutFeedback>
                {props.children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Portal>
      )}
    </>
  )
})

export default Popup

const styles = StyleSheet.create({
  bgLight: {
    backgroundColor: colors.white,
  },
  bgDark: {
    backgroundColor: colors.black, // TODO
  },
  drawerMask: {
    ...a.fixed,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  drawerContainer: {
    display: 'flex',
    ...a.fixed,
    bottom: 0,
    left: 0,
    // height: '100%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
    overflow: 'scroll',
  },
  closeIcon: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 16,
    height: 16,
    zIndex: 10,
  },
})
