import {StyleSheet, View} from 'react-native'
import {type AppBskyActorDefs} from '@atproto/api'

import {makeProfileLink} from '#/lib/routes/links'
import {sanitizeDisplayName} from '#/lib/strings/display-names'
import {sanitizeHandle} from '#/lib/strings/handles'
import {useProfileShadow} from '#/state/cache/profile-shadow'
import {useSession} from '#/state/session'
import {PostThreadFollowBtn} from '#/view/com/post-thread/PostThreadFollowBtn'
import {Link} from '#/view/com/util/Link'
import {PreviewableUserAvatar} from '#/view/com/util/UserAvatar'
import {atoms as a, useTheme} from '#/alf'
import NodeUserBadge from '#/components/NodeUserBadge'
import {Text} from '#/components/Typography'
import {VerificationCheckButton} from '#/components/verification/VerificationCheckButton'

export default function ProposalAuthor({
  author,
}: {
  author: AppBskyActorDefs.ProfileViewBasic
}) {
  const t = useTheme()
  const {currentAccount} = useSession()
  const shadowedPostAuthor = useProfileShadow(author)
  const showFollowButton = currentAccount?.did !== author.did
  const authorHref = makeProfileLink(author)
  const authorTitle = author.handle
  return (
    <View style={[a.flex_row, a.gap_md, a.pb_md]}>
      <PreviewableUserAvatar
        size={42}
        profile={author}
        // moderation={moderation.ui('avatar')}
        type={author.associated?.labeler ? 'labeler' : 'user'}
        // live={live}
      />
      <View style={[a.flex_1]}>
        <View style={[a.flex_row, a.align_center]}>
          <Link style={[a.flex_shrink]} href={authorHref} title={authorTitle}>
            <Text
              emoji
              style={[a.text_lg, a.font_bold, a.leading_snug, a.self_start]}
              numberOfLines={1}>
              {sanitizeDisplayName(
                author.displayName || sanitizeHandle(author.handle),
                // moderation.ui('displayName'),
              )}
            </Text>
          </Link>
          <NodeUserBadge did={author.did} size={14} style={{marginLeft: 4}} />
          <View style={[{paddingLeft: 3, top: -1}]}>
            <VerificationCheckButton profile={shadowedPostAuthor} size="md" />
          </View>
        </View>
        <Link style={a.flex_1} href={authorHref} title={authorTitle}>
          <Text
            emoji
            style={[a.text_md, a.leading_snug, t.atoms.text_contrast_medium]}
            numberOfLines={1}>
            {sanitizeHandle(author.handle, '@')}
          </Text>
        </Link>
      </View>
      {showFollowButton && (
        <View>
          <PostThreadFollowBtn did={author.did} />
        </View>
      )}
    </View>
  )
}
