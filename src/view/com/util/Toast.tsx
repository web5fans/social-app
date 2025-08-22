/*
 * Note: the dataSet properties are used to leverage custom CSS in public/index.html
 */

import {useEffect, useState} from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'
import {Image} from 'expo-image'
import {
  FontAwesomeIcon,
  type FontAwesomeIconStyle,
  type Props as FontAwesomeProps,
} from '@fortawesome/react-native-fontawesome'
import type React from 'react'

const DURATION = 3500

interface ActiveToast {
  text: string
  icon: FontAwesomeProps['icon']
}

type ToastPositionProps = 'default' | 'center'

type GlobalSetActiveToast = (
  _activeToast: ActiveToast | undefined,
  position?: ToastPositionProps,
) => void

// globals
// =
let globalSetActiveToast: GlobalSetActiveToast | undefined
let toastTimeout: NodeJS.Timeout | undefined

// components
// =
type ToastContainerProps = {}
export const ToastContainer: React.FC<ToastContainerProps> = ({}) => {
  const [activeToast, setActiveToast] = useState<ActiveToast | undefined>()
  const [toastPoi, setToastPoi] = useState<ToastPositionProps | undefined>(
    'default',
  )
  useEffect(() => {
    globalSetActiveToast = (t: ActiveToast | undefined, position) => {
      setActiveToast(t)
      setToastPoi(position)
    }
  })

  if (toastPoi === 'center') {
    return (
      <>
        {activeToast && (
          <View style={centerStyles.container}>
            {activeToast.icon === 'check' ? (
              <Image
                source={require('#/assets/checked.svg')}
                accessibilityIgnoresInvertColors
                style={{width: 48, height: 48}}
              />
            ) : (
              <FontAwesomeIcon
                icon={activeToast.icon}
                size={48}
                style={styles.icon as FontAwesomeIconStyle}
              />
            )}
            <Text style={centerStyles.text}>{activeToast.text}</Text>
          </View>
        )}
      </>
    )
  }

  return (
    <>
      {activeToast && (
        <View style={styles.container}>
          <FontAwesomeIcon
            icon={activeToast.icon}
            size={20}
            style={styles.icon as FontAwesomeIconStyle}
          />
          <Text style={styles.text}>{activeToast.text}</Text>
          <Pressable
            style={styles.dismissBackdrop}
            accessibilityLabel="Dismiss"
            accessibilityHint=""
            onPress={() => {
              setActiveToast(undefined)
            }}
          />
        </View>
      )}
    </>
  )
}

// methods
// =

export function show(
  text: string,
  icon: FontAwesomeProps['icon'] = 'check',
  position: ToastPositionProps = 'default',
) {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  globalSetActiveToast?.({text, icon}, position)
  toastTimeout = setTimeout(() => {
    globalSetActiveToast?.(undefined, undefined)
  }, DURATION)
}

const styles = StyleSheet.create({
  container: {
    // @ts-ignore web only
    position: 'fixed',
    left: 20,
    bottom: 20,
    // @ts-ignore web only
    width: 'calc(100% - 40px)',
    maxWidth: 350,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000c',
    borderRadius: 10,
  },
  dismissBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  icon: {
    color: '#fff',
    flexShrink: 0,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
})

const centerStyles = StyleSheet.create({
  container: {
    // @ts-ignore web only
    position: 'fixed',
    top: '30%',
    left: '50%',
    // @ts-ignore web only
    minWidth: 120,
    height: 120,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(69, 72, 74, 0.90)',
    borderRadius: 12,
    boxShadow: '0px 16px 48px 0px rgba(0, 0, 0, 0.16)',
    transform: 'translateX(-50%)',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.80)',
    marginTop: 12,
  },
})
