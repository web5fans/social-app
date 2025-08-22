import {forwardRef, useImperativeHandle, useLayoutEffect, useState} from 'react'
import {StyleSheet, TouchableWithoutFeedback} from 'react-native'
import {View} from 'react-native'
import {Image} from 'expo-image'
import {RemoveScrollBar} from 'react-remove-scroll-bar'

import {colors} from '#/lib/styles'
import {select, useTheme} from '#/alf'
import {atoms as a} from '#/alf'
import {Button} from '#/components/Button'
import {Portal} from '#/components/Portal'
import {Text} from '#/components/Typography'
import {ProposalVoteType} from '#/server/dao/enums'

type VoteConfirmProps = {
  // controls
  zIndex?: number
  onConfirm: (voteFor: ProposalVoteType) => Promise<void>
}

export type VoteConfirmRef = {
  open(nextVoteFor: ProposalVoteType): void
}

const VoteConfirm = forwardRef<VoteConfirmRef, VoteConfirmProps>(
  function VoteConfirm(props, ref) {
    const {zIndex = 1000, onConfirm} = props
    const [popupVisible, setPopupVisible] = useState(false)
    const [showPopupDelayedExit, setShowPopupDelayedExit] =
      useState(popupVisible)
    const [voteFor, setVoteFor] = useState<ProposalVoteType>(
      ProposalVoteType.Agree,
    )
    const t = useTheme()

    useImperativeHandle(
      ref,
      () => {
        return {
          open(nextVoteFor: ProposalVoteType) {
            setVoteFor(nextVoteFor)
            setPopupVisible(true)
          },
        }
      },
      [],
    )

    useLayoutEffect(() => {
      if (popupVisible !== showPopupDelayedExit) {
        if (popupVisible) {
          setShowPopupDelayedExit(true)
        } else {
          const timeout = setTimeout(() => {
            setShowPopupDelayedExit(false)
          }, 150)
          return () => clearTimeout(timeout)
        }
      }
    }, [popupVisible, showPopupDelayedExit])

    // useComposerKeyboardShortcut()
    // useIntentHandler()

    if (!showPopupDelayedExit) return null

    return (
      <Portal>
        <RemoveScrollBar />
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
              popupVisible ? a.fade_in : a.fade_out,
            ]}>
            <Image
              accessibilityIgnoresInvertColors
              style={[styles.voteIcon]}
              source={require('#/assets/proposal/vote.png')}
            />
            <TouchableWithoutFeedback
              accessibilityRole="button"
              onPress={() => setPopupVisible(false)}>
              <Image
                accessibilityIgnoresInvertColors
                style={[styles.closeIcon]}
                source={require('#/assets/close.svg')}
              />
            </TouchableWithoutFeedback>
            <View style={[a.py_xs, a.mb_md]}>
              <Text style={[a.text_md, a.font_bold]}>你确认选择？</Text>
            </View>
            <View style={[a.py_sm, a.mb_2xl]}>
              <Text
                style={[
                  a.text_4xl,
                  a.font_bold,
                  {
                    color:
                      voteFor === ProposalVoteType.Agree
                        ? '#1083FE'
                        : '#FD615B',
                  },
                ]}>
                {voteFor === ProposalVoteType.Agree ? '同意' : '反对'}
              </Text>
            </View>
            <Button
              style={[
                a.w_full,
                a.py_md,
                a.rounded_sm,
                {backgroundColor: '#1083FE'},
              ]}
              label="vote"
              onPress={async () => {
                await onConfirm(voteFor)
                setPopupVisible(false)
              }}>
              <Text style={[a.text_md, {color: colors.white}]}>确认</Text>
            </Button>

            {/* {props.children} */}
          </View>
        </View>
      </Portal>
    )
  },
)
export default VoteConfirm

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
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    right: 0,
    marginInline: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    width: 333,
    paddingTop: 56,
    // bottom: 0,
    // left: 0,
    // height: '100%',
    // width: '100%',
    borderRadius: 10,
    paddingInline: 46,
    paddingBottom: 30,
    backgroundColor: '#fff',
    // overflow: 'scroll',
  },
  voteIcon: {
    position: 'absolute',
    top: -120,
    right: 84,
    width: 141,
    height: 148,
  },
  closeIcon: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 16,
    height: 16,
    zIndex: 10,
    cursor: 'pointer',
  },
})
