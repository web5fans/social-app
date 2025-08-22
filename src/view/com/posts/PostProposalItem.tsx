import {memo, useCallback, useMemo, useState} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {
  type AppBskyActorDefs,
  type AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyFeedThreadgate,
  AtUri,
  type ModerationDecision,
  RichText as RichTextAPI,
} from '@atproto/api'
import {validateLogDeleteMessage} from '@atproto/api/dist/client/types/chat/bsky/convo/defs'
import {
  FontAwesomeIcon,
  type FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQueryClient} from '@tanstack/react-query'

import {useActorStatus} from '#/lib/actor-status'
import {isReasonFeedSource, type ReasonFeedSource} from '#/lib/api/feed/types'
import {MAX_POST_LINES} from '#/lib/constants'
// import {useOpenComposer} from '#/lib/hooks/useOpenComposer'
import {usePalette} from '#/lib/hooks/usePalette'
import {makeProfileLink} from '#/lib/routes/links'
import {sanitizeDisplayName} from '#/lib/strings/display-names'
import {sanitizeHandle} from '#/lib/strings/handles'
import {countLines} from '#/lib/strings/helpers'
import {s} from '#/lib/styles'
import {
  POST_TOMBSTONE,
  type Shadow,
  usePostShadow,
} from '#/state/cache/post-shadow'
import {emitProposalCreated} from '#/state/events'
import {useFeedFeedbackContext} from '#/state/feed-feedback'
import {precacheProfile} from '#/state/queries/profile'
import {useSession} from '#/state/session'
import {useMergedThreadgateHiddenReplies} from '#/state/threadgate-hidden-replies'
import {FeedNameText} from '#/view/com/util/FeedInfoText'
import {PostCtrls} from '#/view/com/util/post-ctrls/PostCtrls'
import {PostEmbeds, PostEmbedViewContext} from '#/view/com/util/post-embeds'
import {PostMeta} from '#/view/com/util/PostMeta'
import * as Toast from '#/view/com/util/Toast'
import {PreviewableUserAvatar} from '#/view/com/util/UserAvatar'
import {atoms as a, useTheme} from '#/alf'
import {Pin_Stroke2_Corner0_Rounded as PinIcon} from '#/components/icons/Pin'
import {Repost_Stroke2_Corner2_Rounded as RepostIcon} from '#/components/icons/Repost'
import {ContentHider} from '#/components/moderation/ContentHider'
import {LabelsOnMyPost} from '#/components/moderation/LabelsOnMe'
import {PostAlerts} from '#/components/moderation/PostAlerts'
import {type AppModerationCause} from '#/components/Pills'
import {ProfileHoverCard} from '#/components/ProfileHoverCard'
import * as Prompt from '#/components/Prompt'
import ProposalStatusTag from '#/components/ProposalStatusTag'
import {RichText} from '#/components/RichText'
import {SubtleWebHover} from '#/components/SubtleWebHover'
import {Text} from '#/components/Typography'
import server from '#/server'
import {ProposalStatus, ProposalVoteType} from '#/server/dao/enums'
import * as bsky from '#/types/bsky'
import {Link, TextLink, TextLinkOnWebOnly} from '../util/Link'

interface FeedItemProps {
  record: AppBskyFeedPost.Record
  // reason:
  //   | AppBskyFeedDefs.ReasonRepost
  //   | AppBskyFeedDefs.ReasonPin
  //   | ReasonFeedSource
  //   | {[k: string]: unknown; $type: string}
  //   | undefined
  moderation: ModerationDecision
  parentAuthor: AppBskyActorDefs.ProfileViewBasic | undefined
  // showReplyTo: boolean
  isThreadChild?: boolean
  isThreadLastChild?: boolean
  isThreadParent?: boolean
  feedContext: string | undefined
  reqId: string | undefined
  hideTopBorder?: boolean
  isParentBlocked?: boolean
  isParentNotFound?: boolean
  listDid: string
}

export function PostProposalItem(
  props: FeedItemProps & {
    post: AppBskyFeedDefs.PostView
    rootPost: AppBskyFeedDefs.PostView
    onShowLess?: (interaction: AppBskyFeedDefs.Interaction) => void
  },
): React.ReactNode {
  const {
    listDid,
    post,
    record,
    // reason,
    feedContext,
    reqId,
    moderation,
    parentAuthor,
    // showReplyTo,
    isThreadChild,
    isThreadLastChild,
    isThreadParent,
    hideTopBorder,
    isParentBlocked,
    isParentNotFound,
    rootPost,
    onShowLess,
  } = props

  const postShadowed = usePostShadow(post)
  const richText = useMemo(
    () =>
      new RichTextAPI({
        text: record.text,
        facets: record.facets,
      }),
    [record],
  )
  if (postShadowed === POST_TOMBSTONE) {
    return null
  }
  if (richText && moderation) {
    return (
      <FeedItemInner
        listDid={listDid}
        // Safeguard from clobbering per-post state below:
        key={postShadowed.uri}
        post={postShadowed}
        record={record}
        // reason={reason}
        feedContext={feedContext}
        reqId={reqId}
        richText={richText}
        parentAuthor={parentAuthor}
        // showReplyTo={showReplyTo}
        moderation={moderation}
        isThreadChild={isThreadChild}
        isThreadLastChild={isThreadLastChild}
        isThreadParent={isThreadParent}
        hideTopBorder={hideTopBorder}
        isParentBlocked={isParentBlocked}
        isParentNotFound={isParentNotFound}
        rootPost={rootPost}
        onShowLess={onShowLess}
      />
    )
  }
  return null
}

let FeedItemInner = ({
  listDid,
  post,
  // record,
  // reason,
  feedContext,
  reqId,
  richText,
  moderation,
  // parentAuthor,
  // showReplyTo,
  isThreadChild,
  isThreadLastChild,
  isThreadParent,
  hideTopBorder,
  // isParentBlocked,
  // isParentNotFound,
  rootPost,
  onShowLess,
}: FeedItemProps & {
  richText: RichTextAPI
  post: APIDao.WebEndpointsProposalProposalPageVo & AppBskyFeedDefs.PostView
  rootPost: AppBskyFeedDefs.PostView
  onShowLess?: (interaction: AppBskyFeedDefs.Interaction) => void
}): React.ReactNode => {
  const queryClient = useQueryClient()
  // const {openComposer} = useOpenComposer()
  const delControl = Prompt.usePromptControl()
  const pal = usePalette('default')
  const {_} = useLingui()
  const [hover, setHover] = useState(false)

  // const href = useMemo(() => {
  //   const urip = new AtUri(post.uri)
  //   return makeProfileLink(post.author, 'post', urip.rkey)
  // }, [post.uri, post.author])
  const href = `/proposal/${post.proposalId}`
  // const {sendInteraction} = useFeedFeedbackContext()

  // const onPressReply = () => {
  //   sendInteraction({
  //     item: post.uri,
  //     event: 'app.bsky.feed.defs#interactionReply',
  //     feedContext,
  //     reqId,
  //   })
  //   openComposer({
  //     replyTo: {
  //       uri: post.uri,
  //       cid: post.cid,
  //       text: record.text || '',
  //       author: post.author,
  //       embed: post.embed,
  //       moderation,
  //     },
  //   })
  // }

  const onOpenAuthor = () => {
    // sendInteraction({
    //   item: post.uri,
    //   event: 'app.bsky.feed.defs#clickthroughAuthor',
    //   feedContext,
    //   reqId,
    // })
  }

  const onOpenReposter = () => {
    // sendInteraction({
    //   item: post.uri,
    //   event: 'app.bsky.feed.defs#clickthroughReposter',
    //   feedContext,
    //   reqId,
    // })
  }

  const onOpenEmbed = () => {
    // sendInteraction({
    //   item: post.uri,
    //   event: 'app.bsky.feed.defs#clickthroughEmbed',
    //   feedContext,
    //   reqId,
    // })
  }

  const onBeforePress = () => {
    // sendInteraction({
    //   item: post.uri,
    //   event: 'app.bsky.feed.defs#clickthroughItem',
    //   feedContext,
    //   reqId,
    // })
    precacheProfile(queryClient, post.author)
  }

  const outerStyles = [
    styles.outer,
    {
      borderColor: pal.colors.border,
      paddingBottom:
        isThreadLastChild || (!isThreadChild && !isThreadParent)
          ? 15
          : undefined,
      borderTopWidth:
        hideTopBorder || isThreadChild ? 0 : StyleSheet.hairlineWidth,
    },
  ]

  const {currentAccount} = useSession()
  const isOwner = post.author.did === currentAccount?.did

  /**
   * If `post[0]` in this slice is the actual root post (not an orphan thread),
   * then we may have a threadgate record to reference
   */
  const threadgateRecord = bsky.dangerousIsType<AppBskyFeedThreadgate.Record>(
    rootPost.threadgate?.record,
    AppBskyFeedThreadgate.isRecord,
  )
    ? rootPost.threadgate.record
    : undefined

  const {isActive: live} = useActorStatus(post.author)

  return (
    <>
      <Link
        testID={`feedItem-by-${post.author.handle}`}
        style={outerStyles}
        href={href}
        noFeedback
        accessible={false}
        onBeforePress={onBeforePress}
        dataSet={{feedContext}}
        onPointerEnter={() => {
          setHover(true)
        }}
        onPointerLeave={() => {
          setHover(false)
        }}>
        <SubtleWebHover hover={hover} />
        <View style={{flexDirection: 'row', gap: 10, paddingLeft: 8}}>
          <View style={{width: 42}}>
            {isThreadChild && (
              <View
                style={[
                  styles.replyLine,
                  {
                    flexGrow: 1,
                    backgroundColor: pal.colors.replyLine,
                    marginBottom: 4,
                  },
                ]}
              />
            )}
          </View>

          <View style={{paddingTop: 12, flexShrink: 1}} />
        </View>

        <View style={styles.layout}>
          <View style={styles.layoutAvi}>
            <PreviewableUserAvatar
              size={42}
              profile={post.author}
              moderation={moderation.ui('avatar')}
              type={post.author.associated?.labeler ? 'labeler' : 'user'}
              // onBeforePress={onOpenAuthor}
              live={live}
            />
            {isThreadParent && (
              <View
                style={[
                  styles.replyLine,
                  {
                    flexGrow: 1,
                    backgroundColor: pal.colors.replyLine,
                    marginTop: live ? 8 : 4,
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.layoutContent}>
            <View style={[a.flex_row, a.justify_between, a.gap_md]}>
              <PostMeta
                author={post.author}
                moderation={moderation}
                timestamp={post.indexedAt}
                postHref={href}
                // onOpenAuthor={onOpenAuthor}
                style={{flex: 1}}
              />
              {isOwner && listDid === currentAccount?.did && (
                <Pressable
                  accessibilityRole="button"
                  style={{flex: 0, flexBasis: 22}}
                  onPress={() => delControl.open()}>
                  <Image
                    accessibilityIgnoresInvertColors
                    style={{width: 18, height: 18}}
                    source={require('#/assets/dustbin.svg')}
                  />
                </Pressable>
              )}
            </View>
            {/* {showReplyTo &&
            (parentAuthor || isParentBlocked || isParentNotFound) && (
              <ReplyToLabel
                blocked={isParentBlocked}
                notFound={isParentNotFound}
                profile={parentAuthor}
              />
            )} */}
            <LabelsOnMyPost post={post} />
            <PostContent
              moderation={moderation}
              richText={richText}
              postEmbed={post.embed}
              postAuthor={post.author}
              onOpenEmbed={onOpenEmbed}
              post={post}
              threadgateRecord={threadgateRecord}
            />
            {/* <PostCtrls
            post={post}
            record={record}
            richText={richText}
            onPressReply={onPressReply}
            logContext="FeedItem"
            feedContext={feedContext}
            reqId={reqId}
            threadgateRecord={threadgateRecord}
            onShowLess={onShowLess}
          /> */}
          </View>
        </View>
      </Link>
      <Prompt.Basic
        control={delControl}
        title="要删除这则提案吗？"
        description="如果你删除这则提案，则以后将无法恢复。"
        confirmButtonCta="删除"
        onConfirm={async () => {
          const flag = await server.dao('POST /proposal/delete-my-proposal', {
            proposalId: post.proposalId,
          })
          if (flag) {
            Toast.show('删除成功', 'check', 'center')
            emitProposalCreated()
            // navigation.goBack()
          }
        }}
        confirmButtonColor="negative"
      />
    </>
  )
}
FeedItemInner = memo(FeedItemInner)

let PostContent = ({
  post,
  moderation,
  richText,
  postEmbed,
  postAuthor,
  onOpenEmbed,
  threadgateRecord,
}: {
  moderation: ModerationDecision
  richText: RichTextAPI
  postEmbed: AppBskyFeedDefs.PostView['embed']
  postAuthor: AppBskyFeedDefs.PostView['author']
  onOpenEmbed: () => void
  post: AppBskyFeedDefs.PostView
  threadgateRecord?: AppBskyFeedThreadgate.Record
}): React.ReactNode => {
  const pal = usePalette('default')
  const {_} = useLingui()
  const t = useTheme()
  const {currentAccount} = useSession()
  const [limitLines, setLimitLines] = useState(
    () => countLines(richText.text) >= MAX_POST_LINES,
  )
  const threadgateHiddenReplies = useMergedThreadgateHiddenReplies({
    threadgateRecord,
  })
  const additionalPostAlerts: AppModerationCause[] = useMemo(() => {
    const isPostHiddenByThreadgate = threadgateHiddenReplies.has(post.uri)
    const rootPostUri = bsky.dangerousIsType<AppBskyFeedPost.Record>(
      post.record,
      AppBskyFeedPost.isRecord,
    )
      ? post.record?.reply?.root?.uri || post.uri
      : undefined
    const isControlledByViewer =
      rootPostUri && new AtUri(rootPostUri).host === currentAccount?.did
    return isControlledByViewer && isPostHiddenByThreadgate
      ? [
          {
            type: 'reply-hidden',
            source: {type: 'user', did: currentAccount?.did},
            priority: 6,
          },
        ]
      : []
  }, [post, currentAccount?.did, threadgateHiddenReplies])

  const onPressShowMore = useCallback(() => {
    setLimitLines(false)
  }, [setLimitLines])

  return (
    <ContentHider
      testID="contentHider-post"
      modui={moderation.ui('contentList')}
      ignoreMute
      childContainerStyle={styles.contentHiderChild}>
      <PostAlerts
        modui={moderation.ui('contentList')}
        style={[a.py_2xs]}
        additionalCauses={additionalPostAlerts}
      />
      {richText.text ? (
        <View style={styles.postTextContainer}>
          <Text style={[a.mt_xs, a.text_sm, t.atoms.text_contrast_high]}>
            {post.name}
          </Text>
          <View style={[a.flex_row, a.gap_xs, a.mt_sm]}>
            <ProposalStatusTag status={post.status} />
            {post.choice === ProposalVoteType.Oppose ||
            post.choice === ProposalVoteType.Agree ? (
              <View
                style={[
                  a.p_xs,
                  {borderColor: '#6F869F', borderWidth: 1, borderRadius: 4},
                ]}>
                <Text style={[a.text_xs, {color: '#6F869F'}]}>已投票</Text>
              </View>
            ) : null}
          </View>
          <VoltState agree={post.agreeVotes} disagree={post.opposeVotes} />
          {/* <RichText
            enableTags
            testID="postText"
            value={richText}
            numberOfLines={limitLines ? MAX_POST_LINES : undefined}
            style={[a.flex_1, a.text_md]}
            authorHandle={postAuthor.handle}
            shouldProxyLinks={true}
          /> */}
        </View>
      ) : undefined}
      {/* {limitLines ? (
        <TextLink
          text={_(msg`Show More`)}
          style={pal.link}
          onPress={onPressShowMore}
          href="#"
        />
      ) : undefined} */}
      {/* {postEmbed ? (
        <View style={[a.pb_xs]}>
          <PostEmbeds
            embed={postEmbed}
            moderation={moderation}
            onOpen={onOpenEmbed}
            viewContext={PostEmbedViewContext.Feed}
          />
        </View>
      ) : null} */}
    </ContentHider>
  )
}
PostContent = memo(PostContent)

function VoltState({
  agree: unsafe_agree,
  disagree: unsafe_disagree,
}: {
  agree: number | undefined
  disagree: number | undefined
}) {
  const {agreeVal, disagreeVal, agreePercent, disagreePercent} = useMemo(() => {
    const agree = unsafe_agree || 0
    const disagree = unsafe_disagree || 0
    const sum = agree + disagree
    if (sum === 0) {
      return {
        agreeVal: 0,
        disagreeVal: 0,
        agreePercent: '0%' as `${number}%`,
        disagreePercent: '0%' as `${number}%`,
      }
    }
    // const agreePercentVal = (agree / sum * 100).toFixed(0);
    return {
      agreeVal: agree,
      disagreeVal: disagree,
      agreePercent: `${((agree / sum) * 100).toFixed(0)}%` as `${number}%`,
      disagreePercent: `${((disagree / sum) * 100).toFixed(
        0,
      )}%` as `${number}%`,
    }
  }, [unsafe_agree, unsafe_disagree])

  return (
    <View style={[a.mt_md]}>
      <View style={[voltStyles.line]}>
        <View style={[voltStyles.bar]}>
          <View
            style={[
              voltStyles.barInner,
              {backgroundColor: '#1083FE', width: agreePercent},
            ]}
          />
          <View style={[voltStyles.barLabel]}>
            <Text style={[a.text_xs]}>同意</Text>
          </View>
        </View>
        <View style={[voltStyles.value]}>
          <Text style={[a.text_xs]}>{agreeVal}</Text>
        </View>
        <View style={[voltStyles.percent]}>
          <Text style={[a.text_xs]}>({agreePercent})</Text>
        </View>
      </View>
      <View style={[voltStyles.line, a.mt_sm]}>
        <View style={[voltStyles.bar]}>
          <View
            style={[
              voltStyles.barInner,
              {backgroundColor: '#FD615B', width: disagreePercent},
            ]}
          />
          <View style={[voltStyles.barLabel]}>
            <Text style={[a.text_xs]}>反对</Text>
          </View>
        </View>
        <View style={[voltStyles.value]}>
          <Text style={[a.text_xs]}>{disagreeVal}</Text>
        </View>
        <View style={[voltStyles.percent]}>
          <Text style={[a.text_xs]}>({disagreePercent})</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    paddingLeft: 10,
    paddingRight: 15,
    // @ts-ignore web only -prf
    cursor: 'pointer',
  },
  replyLine: {
    width: 2,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  includeReason: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    marginLeft: -16,
  },
  layout: {
    flexDirection: 'row',
    marginTop: 1,
  },
  layoutAvi: {
    paddingLeft: 8,
    paddingRight: 10,
    position: 'relative',
    zIndex: 999,
  },
  layoutContent: {
    position: 'relative',
    flex: 1,
    zIndex: 0,
  },
  alert: {
    marginTop: 6,
    marginBottom: 6,
  },
  postTextContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // flexWrap: 'wrap',
    // paddingBottom: 2,
    // overflow: 'hidden',
  },
  contentHiderChild: {
    marginTop: 6,
  },
  embed: {
    marginBottom: 6,
  },
  translateLink: {
    marginBottom: 6,
  },
})

const voltStyles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    columnGap: 4,
    alignItems: 'center',
  },
  bar: {
    position: 'relative',
    flex: 1,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#f1f3f5',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
  },
  barLabel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 2,
    left: 4,
    marginBlock: 'auto',
    zIndex: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  value: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    flexBasis: 20,
    // width: 200,
  },
  percent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    flexBasis: 40,
  },
})
