import {View} from 'react-native'
import {type AppBskyActorDefs, type ModerationDecision} from '@atproto/api'

import {sanitizeDisplayName} from '#/lib/strings/display-names'
import {sanitizeHandle} from '#/lib/strings/handles'
import {type Shadow} from '#/state/cache/types'
import {atoms as a, tokens,useBreakpoints, useTheme} from '#/alf'
import NodeUserBadge from '#/components/NodeUserBadge'
import {Text} from '#/components/Typography'

export function ProfileHeaderDisplayName({
  profile,
  moderation,
}: {
  profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>
  moderation: ModerationDecision
}) {
  const t = useTheme()
  const {gtMobile} = useBreakpoints()

  return (
    <View
      pointerEvents="none"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}>
      <Text
        emoji
        testID="profileHeaderDisplayName"
        numberOfLines={1}
        style={[
          t.atoms.text,
          gtMobile ? a.text_4xl : a.text_3xl,
          a.self_start,
          a.font_heavy,
        ]}>
        {sanitizeDisplayName(
          profile.displayName || sanitizeHandle(profile.handle),
          moderation.ui('displayName'),
        )}
      </Text>
      <NodeUserBadge
        did={profile.did}
        size={gtMobile ? tokens.fontSize._2xl : tokens.fontSize.xl}
      />
    </View>
  )
}
