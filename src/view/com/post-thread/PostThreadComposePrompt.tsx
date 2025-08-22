import {Pressable, View} from 'react-native'
import {Image} from 'expo-image'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {useHaptics} from '#/lib/haptics'
import {type ThreadNode, type ThreadPost} from '#/state/queries/post-thread'
import {useProfileQuery} from '#/state/queries/profile'
import {useSession} from '#/state/session'
import {UserAvatar} from '#/view/com/util/UserAvatar'
import {atoms as a, ios, useBreakpoints, useTheme} from '#/alf'
import {useDialogControl} from '#/components/Dialog'
import {useInteractionState} from '#/components/hooks/useInteractionState'
import RewardScoresDialog from '#/components/RewardScoresDialog'
import {Text} from '#/components/Typography'

export function PostThreadComposePrompt({
  onPressCompose,
  thread,
}: {
  onPressCompose: () => void
  thread: ThreadNode
}) {
  const {currentAccount} = useSession()
  const {data: profile} = useProfileQuery({did: currentAccount?.did})
  const {_} = useLingui()
  const {gtMobile} = useBreakpoints()
  const t = useTheme()
  const playHaptic = useHaptics()
  const rewardDialogControl = useDialogControl()
  const {
    state: hovered,
    onIn: onHoverIn,
    onOut: onHoverOut,
  } = useInteractionState()

  const postAuthorDid = (thread as ThreadPost)?.post?.author?.did
  const currentAccountDid = currentAccount?.did
  const showReward =
    !!currentAccountDid &&
    !!postAuthorDid &&
    postAuthorDid !== currentAccountDid
  return (
    <View
      style={[
        gtMobile ? a.py_xs : {paddingBlock: 7},
        a.px_lg,
        a.border_t,
        t.atoms.border_contrast_low,
        t.atoms.bg,
        {gap: 16, flexDirection: 'row'},
      ]}>
      {showReward && (
        <>
          <Pressable accessibilityRole="button" onPress={() => rewardDialogControl.open()}>
            <View style={{gap: 8, alignItems: 'center'}}>
              <Image
                source={require('#/assets/gift.svg')}
                alt="reward poster"
                style={{width: 24, height: 24}}
              />
              <Text style={[a.text_xs]}>打赏</Text>
            </View>
          </Pressable>
          <RewardScoresDialog
            control={rewardDialogControl}
            toUserDid={(thread as ThreadPost)?.post.author?.did}
          />
        </>
      )}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={_(msg`Compose reply`)}
        accessibilityHint={_(msg`Opens composer`)}
        style={[
          a.flex_row,
          a.align_center,
          a.p_sm,
          a.gap_sm,
          a.rounded_full,
          (!gtMobile || hovered) && t.atoms.bg_contrast_25,
          a.transition_color,
          a.flex_1,
        ]}
        onPress={() => {
          onPressCompose()
          playHaptic('Light')
        }}
        onLongPress={ios(() => {
          onPressCompose()
          playHaptic('Heavy')
        })}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}>
        <UserAvatar
          size={32}
          // size={gtMobile ? 24 : 22}
          avatar={profile?.avatar}
          type={profile?.associated?.labeler ? 'labeler' : 'user'}
        />
        <Text style={[a.text_md, t.atoms.text_contrast_medium]}>
          <Trans>Write your reply</Trans>
        </Text>
      </PressableScale>
    </View>
  )
}
