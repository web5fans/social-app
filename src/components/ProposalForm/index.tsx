import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {useRequest} from 'ahooks'
import {DismissableLayer, FocusGuards, FocusScope} from 'radix-ui/internal'
import {RemoveScrollBar} from 'react-remove-scroll-bar'

import {useA11y} from '#/state/a11y'
import {useModals} from '#/state/modals'
import {useSession} from '#/state/session'
import {type ComposerOpts, useComposerState} from '#/state/shell/composer'
import {
  EmojiPicker,
  type EmojiPickerPosition,
  type EmojiPickerState,
} from '#/view/com/composer/text-input/web/EmojiPicker'
import {atoms as a, flatten, useBreakpoints, useTheme} from '#/alf'
import server from '#/server'
import {Portal} from '../Portal'
import ProposalAffixTrigger from './AffixTrigger'
import ProposalForm, {useProposalFormRef} from './ProposalForm'

const BOTTOM_BAR_HEIGHT = 61

export default function ProposalFormModal(props: {affixLeft: number}) {
  const {currentAccount} = useSession()
  const [active, setActive] = useState(false)
  const {data: currentUserProfile} = useRequest(
    async () => {
      return server.dao('POST /user/login-user-detail')
    },
    {ready: !!currentAccount?.did},
  )
  if (!currentUserProfile?.nodeUser) {
    return null
  }
  return (
    <>
      <ProposalAffixTrigger
        onPress={() => setActive(true)}
        affixLeft={props.affixLeft}
      />
      {active && <ProposalFormModalInner onClose={() => setActive(false)} />}
    </>
  )
}

type ProposalFormModalInnerProps = {
  onClose: () => void
}

function ProposalFormModalInner(props: ProposalFormModalInnerProps) {
  const {onClose} = props
  const state = useComposerState()
  const ref = useProposalFormRef()
  // const { isModalActive } = useModals()
  const t = useTheme()
  const {gtMobile} = useBreakpoints()
  const {reduceMotionEnabled} = useA11y()
  // const [pickerState, setPickerState] = React.useState<EmojiPickerState>({
  //   isOpen: false,
  //   pos: { top: 0, left: 0, right: 0, bottom: 0, nextFocusRef: null },
  // })

  // const onOpenPicker = React.useCallback(
  //   (pos: EmojiPickerPosition | undefined) => {
  //     if (!pos) return
  //     setPickerState({
  //       isOpen: true,
  //       pos,
  //     })
  //   },
  //   [],
  // )

  // const onClosePicker = React.useCallback(() => {
  //   setPickerState(prev => ({
  //     ...prev,
  //     isOpen: false,
  //   }))
  // }, [])

  FocusGuards.useFocusGuards()

  return (
    <Portal>
      <RemoveScrollBar />
      <FocusScope.FocusScope loop trapped asChild>
        <DismissableLayer.DismissableLayer
          role="dialog"
          aria-modal
          style={flatten([
            {position: 'fixed'},
            a.inset_0,
            {backgroundColor: '#000c'},
            a.flex,
            a.flex_col,
            a.align_center,
            a.z_10,
            !reduceMotionEnabled && a.fade_in,
          ])}
          onFocusOutside={evt => evt.preventDefault()}
          onInteractOutside={evt => evt.preventDefault()}
          onDismiss={() => {
            // TEMP: remove when all modals are ALF'd -sfn
            // if (!isModalActive) {
            //   ref.current?.onPressCancel()
            // }
            onClose()
          }}>
          <View
            style={[
              styles.container,
              !gtMobile && styles.containerMobile,
              t.atoms.bg,
              t.atoms.border_contrast_medium,
              !reduceMotionEnabled && [
                a.zoom_fade_in,
                {animationDelay: 0.1},
                {animationFillMode: 'backwards'},
              ],
            ]}>
            <ProposalForm
              onClose={onClose}
              cancelRef={ref}
              // replyTo={state.replyTo}
              quote={state?.quote}
              onPost={state?.onPost}
              mention={state?.mention}
              // openEmojiPicker={onOpenPicker}
              text={state?.text}
              imageUris={state?.imageUris}
            />
          </View>
          {/* <EmojiPicker state={pickerState} close={onClosePicker} /> */}
        </DismissableLayer.DismissableLayer>
      </FocusScope.FocusScope>
    </Portal>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    maxWidth: 600,
    width: '100%',
    paddingVertical: 0,
    borderRadius: 8,
    marginBottom: 0,
    borderWidth: 1,
    // @ts-expect-error web only
    maxHeight: 'calc(100% - (40px * 2))',
    overflow: 'hidden',
  },
  containerMobile: {
    borderRadius: 0,
    marginBottom: BOTTOM_BAR_HEIGHT,
    // @ts-expect-error web only
    maxHeight: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)`,
  },
})
