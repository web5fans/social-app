import {
  type PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'
import {Image} from 'expo-image'
import {moderatePost, RichText as RichTextAPI} from '@atproto/api'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'
import {format} from 'date-fns'
import {isNil} from 'lodash'

import {parseFileComposeId} from '#/lib/extractAssetUrl'
import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {isMobileWeb} from '#/platform/detection'
import {emitProposalCreated} from '#/state/events'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {
  fillThreadModerationCache,
  ThreadModerationCache,
} from '#/state/queries/post-thread'
import {useProfileQuery} from '#/state/queries/profile'
import {useSession} from '#/state/session'
import * as Toast from '#/view/com/util/Toast'
import {
  atoms as a,
  useBreakpoints,
  useLayoutBreakpoints,
  useTheme,
  web,
} from '#/alf'
import {Button} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {ScrollbarOffsetContext} from '#/components/Layout/context'
import * as Prompt from '#/components/Prompt'
import ProposalStatusTag from '#/components/ProposalStatusTag'
import {RichText} from '#/components/RichText'
import {Text} from '#/components/Typography'
import server from '#/server'
import {ProposalStatus, ProposalVoteType} from '#/server/dao/enums'
import ProposalAuthor from './ProposalAuthor'
import ProposalEmbeds from './ProposalEmbeds'
import parserHTMLFile, {type HTMLBlock} from './util'
import VoteConfirm, {type VoteConfirmRef} from './VoteConfirm'
const {Header} = Layout
import {useSetMinimalShellMode} from '#/state/shell'
import {CENTER_COLUMN_OFFSET, SCROLLBAR_OFFSET} from '#/components/Layout/const'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'ProposalDetail'>

export default function ProposalDetailScreen({route}: Props) {
  const {proposalId} = route.params
  const headerRef = useRef<View | null>(null)
  const {currentAccount} = useSession()
  const navigation = useNavigation()
  const {gtMobile} = useBreakpoints()
  const delControl = Prompt.usePromptControl()
  const voteConfirmRef = useRef<VoteConfirmRef>(null)
  const {isWithinOffsetView} = useContext(ScrollbarOffsetContext)
  const {centerColumnOffset} = useLayoutBreakpoints()

  const {data: currentUserInfo} = useRequest(
    async () => {
      const res = await server.dao('POST /user/login-user-detail')
      return res
    },
    {
      ready: !!currentAccount?.did,
    },
  )

  const {data: votedInfo, run: reloadVoteInfo} = useRequest(
    async () => {
      const res = await server.dao('POST /proposal/my-proposal-choice', {
        proposalId,
      })
      return res
    },
    {
      ready: !!currentAccount?.did && !!proposalId,
      refreshDeps: [proposalId],
    },
  )

  const {data: proposalInfo, run: reloadProposalInfo} = useRequest(
    async () => {
      const res = (await server.dao('POST /proposal/detail', {proposalId})) as
        | null
        | (APIDao.WebEndpointsProposalProposalDetailVo & {
            content: string
            blocks: HTMLBlock[]
          })
      // if (res) {
      //   res.attachId = "2-559c9cd426ea4c3b87a6a8667d3e2bdb-proposal_content.txt";
      // }
      if (res?.attachId) {
        const {fileType, fileId} = parseFileComposeId(res.attachId)!
        const fileBlob = await server.dao(
          'GET /file/download',
          {fileId, fileType},
          {responseType: 'blob'},
        )
        //
        if (fileBlob) {
          const fileContent = await fileBlob.text()
          const blocks = parserHTMLFile(fileContent)
          res.content = fileContent
          res.blocks = blocks
        }
      }
      return res
    },
    {
      ready: !!proposalId,
      refreshDeps: [proposalId],
    },
  )
  const t = useTheme()

  const reload = () => {
    reloadVoteInfo()
    reloadProposalInfo()
  }

  const setMinimalShellMode = useSetMinimalShellMode()
  useFocusEffect(
    useCallback(() => {
      setMinimalShellMode(false)
    }, [setMinimalShellMode]),
  )

  // const mockEmbed = {
  //   $type: 'app.bsky.embed.images#view',
  //   images: [
  //     {
  //       thumb:
  //         'https://xiangjiandao.rivtower.cc/bsky/img/feed_thumbnail/plain/did:plc:pc5gxd5my6uooild5drcixdm/bafkreigzzzfwbraggh4zfxws6qladwrpwvpihscaqigkgb5zusvi6zfixu@jpeg',
  //       fullsize:
  //         'https://xiangjiandao.rivtower.cc/bsky/img/feed_fullsize/plain/did:plc:pc5gxd5my6uooild5drcixdm/bafkreigzzzfwbraggh4zfxws6qladwrpwvpihscaqigkgb5zusvi6zfixu@jpeg',
  //       alt: '',
  //       aspectRatio: {width: 474, height: 474},
  //     },
  //     {
  //       thumb:
  //         'https://xiangjiandao.rivtower.cc/bsky/img/feed_thumbnail/plain/did:plc:pc5gxd5my6uooild5drcixdm/bafkreigzzzfwbraggh4zfxws6qladwrpwvpihscaqigkgb5zusvi6zfixu@jpeg',
  //       fullsize:
  //         'https://xiangjiandao.rivtower.cc/bsky/img/feed_fullsize/plain/did:plc:pc5gxd5my6uooild5drcixdm/bafkreigzzzfwbraggh4zfxws6qladwrpwvpihscaqigkgb5zusvi6zfixu@jpeg',
  //       alt: '',
  //       aspectRatio: {width: 474, height: 474},
  //     },
  //   ],
  // }

  const mockAuthor = proposalInfo?.initiatorDid
    ? {
        avatar: proposalInfo?.initiatorAvatar,
        // createdAt: '2025-06-03T05:34:27.189Z',
        did: proposalInfo?.initiatorDid, // 'did:plc:pc5gxd5my6uooild5drcixdm',
        displayName:
          proposalInfo?.initiatorName ?? proposalInfo.initiatorDomainName, // '',
        handle: proposalInfo?.initiatorDomainName, // 'zhengzhou.web5.rivtower.cc',
        labels: [],
        viewer: {muted: false, blockedBy: false},
      }
    : null

  const canDelProposal =
    currentAccount?.did && currentAccount?.did === proposalInfo?.initiatorDid
  const canVote =
    currentUserInfo?.nodeUser &&
    votedInfo?.choice === ProposalVoteType.Unknown &&
    proposalInfo?.status === ProposalStatus.InProgress
  // if(!propsosalDetail) return null;
  // console.log(canVote, !!currentUserInfo?.nodeUser, votedInfo?.choice === ProposalVoteType.Unknown, proposalInfo?.status === ProposalStatus.InProgress)
  return (
    <Layout.Screen
      style={[
        styles.page,
        // isMobileWeb ? { height: '-webkit-fill-available' } : {},
        gtMobile && styles.maxPageWidth,

        // { paddingBottom: gtMobile ? 0 : 58 }
      ]}
      testID="proposalDetailScreen">
      {/* <PostThreadComponent uri={uri} /> */}
      <Header.Outer headerRef={headerRef}>
        <Header.BackButton defalutBackRoute="Hall" />
        <Header.Content>
          <Header.TitleText>提案</Header.TitleText>
        </Header.Content>
        <Header.Slot>
          {canDelProposal && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                delControl.open()
              }}>
              <View style={[a.align_end]}>
                <Image
                  accessibilityIgnoresInvertColors
                  style={{width: 22, height: 22}}
                  source={require('#/assets/dustbin.svg')}
                />
              </View>
            </Pressable>
          )}
          {/* <ThreadMenu
            sortReplies={sortReplies}
            treeViewEnabled={treeViewEnabled}
            setSortReplies={updateSortReplies}
            setTreeViewEnabled={updateTreeViewEnabled}
            /> */}
        </Header.Slot>
      </Header.Outer>

      <View
        style={[
          a.px_lg,
          !isWithinOffsetView && {
            transform: [
              {translateX: centerColumnOffset ? CENTER_COLUMN_OFFSET : 0},
              {translateX: web(SCROLLBAR_OFFSET) ?? 0},
            ],
          },
          gtMobile ? {minHeight: 'calc(100% - 52px - 61px)'} : {},
        ]}>
        <View style={[a.pt_lg]}>
          {mockAuthor && <ProposalAuthor author={mockAuthor} />}
        </View>
        <View style={[a.pt_md]}>
          <Text style={[a.text_xl, a.font_bold]}>{proposalInfo?.name}</Text>
        </View>
        <View style={[a.flex_row, a.align_center, a.justify_between, a.my_md]}>
          <ProposalStatusTag status={proposalInfo?.status} />
          {proposalInfo?.createdAt && (
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <Image
                accessibilityIgnoresInvertColors
                style={{width: 16, height: 16}}
                source={require('#/assets/clock.svg')}
              />
              <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
                {format(new Date(proposalInfo.createdAt), 'yyyy/MM/dd HH:mm')}
              </Text>
            </View>
          )}
        </View>
        <View>
          <View style={[styles.spliter]} />
        </View>

        {/* <pre dangerouslySetInnerHTML={{ __html: proposalInfo?.content }} /> */}
        {proposalInfo?.blocks?.map((block, index) => {
          if (block.type === 'images') {
            return (
              <ProposalEmbeds
                key={index}
                embed={{
                  $type: 'app.bsky.embed.images#view',
                  images: block.srcs.map(imgSrc => ({
                    thumb: imgSrc,
                    fullsize: imgSrc,
                    alt: '',
                    aspectRatio: {width: 474, height: 474},
                  })),
                }}
              />
            )
          }
          return (
            <div
              style={{wordBreak: 'break-all'}}
              key={index}
              dangerouslySetInnerHTML={{__html: block.content}}
            />
          )
        })}
        {/* <View style={[styles.blockTitle]}>
            <Text style={[a.text_md]}>proposalId: {proposalId}</Text>
          </View>
          <View style={[styles.blockContent]}>
            <RichText
              enableTags
              selectable
              value={new RichTextAPI({ text: '<span style="color: red">3132</span>' })}
              style={[a.flex_1, a.text_xl]}
              // authorHandle={post.author.handle}
              shouldProxyLinks={true}
            />
            <View style={[a.py_xs]}>
              <ProposalEmbeds embed={mockEmbed} />
            </View>
          </View> */}
        <VoteResult
          agree={proposalInfo?.agreeVotes}
          disagree={proposalInfo?.opposeVotes}
          status={proposalInfo?.status}
          endDate={proposalInfo?.endAt}
          votedInfo={votedInfo}
        />
        {/* 投票框底部占位 */}
        <View style={{height: 100}} />
        {/* { canVote ? <View style={{ height: 40 }} /> : null} */}
      </View>

      {canVote ? (
        <View
          style={[
            a.flex_row,
            a.align_center,
            a.px_lg,
            a.gap_sm,
            a.py_sm,
            styles.voteActionBorder,
            // a.absolute,
            {
              position: gtMobile ? 'sticky' : 'fixed',
              bottom: gtMobile ? 0 : 58,
              left: 0,
              right: 0,
              backgroundColor: '#fff',
            },
            !isWithinOffsetView && {
              transform: [
                {translateX: centerColumnOffset ? CENTER_COLUMN_OFFSET : 0},
                {translateX: web(SCROLLBAR_OFFSET) ?? 0},
              ],
            },
          ]}>
          <SkewButton
            label="disagree"
            position="left"
            color="#FD615B"
            onPress={() =>
              voteConfirmRef.current?.open(ProposalVoteType.Oppose)
            }>
            <Text style={[a.text_md, {color: '#fff'}]}>反对</Text>
          </SkewButton>
          <SkewButton
            label="agree"
            position="right"
            color="#1083FE"
            onPress={() =>
              voteConfirmRef.current?.open(ProposalVoteType.Agree)
            }>
            <Text style={[a.text_md, {color: '#fff'}]}>同意</Text>
          </SkewButton>
        </View>
      ) : null}
      <Prompt.Basic
        control={delControl}
        title="要删除这则提案吗？"
        description="如果你删除这则提案，则以后将无法恢复。"
        confirmButtonCta="删除"
        onConfirm={async () => {
          const flag = await server.dao('POST /proposal/delete-my-proposal', {
            proposalId,
          })
          if (flag) {
            Toast.show('删除成功', 'check', 'center')
            emitProposalCreated()
            navigation.goBack()
          }
        }}
        confirmButtonColor="negative"
      />

      <VoteConfirm
        ref={voteConfirmRef}
        onConfirm={async voteFor => {
          console.log('goingt to vote', voteFor)
          const flag = await server.dao('POST /proposal/vote', {
            proposalId,
            choose: voteFor,
          })
          if (flag) {
            Toast.show('投票成功', 'check', 'center')
            reload()
            emitProposalCreated()
          }
          // Toast.show('报错', 'xmark');
        }}
      />
    </Layout.Screen>
  )
}

type SkewButtonProps = {
  label: string
  position: 'left' | 'right'
  color: string
  onPress: () => void
}

function SkewButton({
  label,
  position,
  color,
  children,
  onPress,
}: PropsWithChildren<SkewButtonProps>) {
  return (
    <Button label={label} style={[styles.skewButton]} onPress={onPress}>
      <View style={[a.h_full, a.w_full]}>
        <View
          style={[
            styles.skewButtonBGRounded,
            {
              [position === 'left' ? 'left' : 'right']: 0,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.skewButtonBGSkew,
            {
              [position === 'left' ? 'right' : 'left']: 0,
              backgroundColor: color,
            },
          ]}
        />
        <View style={[a.h_full, a.align_center, a.justify_center]}>
          {children}
        </View>
      </View>
    </Button>
  )
}

type VoteResultProps = {
  agree: number | undefined
  disagree: number | undefined
  status: ProposalStatus | undefined
  endDate: string | undefined
  votedInfo: APIDao.WebEndpointsProposalMyProposalChoiceVo | null | undefined
}

function VoteResult(props: VoteResultProps) {
  const {
    agree: unsafe_agree,
    disagree: unsafe_disagree,
    status,
    endDate,
    votedInfo,
  } = props
  const t = useTheme()
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
    <View style={[a.mb_2xl, a.mt_lg]}>
      <View style={[styles.spliter, a.mb_md]} />
      <View style={[a.flex_row, a.align_center, a.justify_between, a.py_xs]}>
        <View>
          <Text style={[a.text_sm, a.font_bold]}>
            总投票数: {agreeVal + disagreeVal}
          </Text>
        </View>
        {status && status !== ProposalStatus.InProgress ? (
          <Text style={[a.text_xs, a.font_bold, {color: '#FD615B'}]}>
            已结束
          </Text>
        ) : (
          <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
            截止时间:{' '}
            {endDate ? format(new Date(endDate), 'yyyy/MM/dd HH:mm:ss') : '-'}
          </Text>
        )}
      </View>
      <View style={[a.mt_sm, voteStyles.border, a.p_lg]}>
        {(votedInfo?.choice === ProposalVoteType.Agree ||
          votedInfo?.choice === ProposalVoteType.Oppose) && (
          <View style={[a.mb_md]}>
            <Text style={[a.text_xs, t.atoms.text_contrast_low]}>
              你已选:{' '}
              {votedInfo?.choice === ProposalVoteType.Agree ? '同意' : '反对'}
            </Text>
          </View>
        )}

        <View style={[a.flex_row, a.align_center, a.gap_md, a.pb_md]}>
          <Text>同意</Text>
          <View style={voteStyles.bar}>
            <View
              style={[
                voteStyles.barInner,
                {backgroundColor: '#1083FE', width: agreePercent},
              ]}
            />
          </View>
          <View style={{width: 18}}>
            <Text>{agreeVal}</Text>
          </View>
          <View style={{width: 50}}>
            <Text>({agreePercent})</Text>
          </View>
        </View>
        <View style={[a.flex_row, a.align_center, a.gap_md]}>
          <Text>反对</Text>
          <View style={voteStyles.bar}>
            <View
              style={[
                voteStyles.barInner,
                {backgroundColor: '#FD615B', width: disagreePercent},
              ]}
            />
          </View>
          <View style={{width: 18}}>
            <Text>{disagreeVal}</Text>
          </View>
          <View style={{width: 50}}>
            <Text>({disagreePercent})</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    minHeight: '100%',
    width: '100%',
  },
  maxPageWidth: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  // main: {
  //   height: 'calc(100% - 52px - 58px)',
  // },
  blockTitle: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 131, 254, 0.1)',
  },
  blockContent: {
    marginTop: 16,
  },
  spliter: {
    height: 1,
    width: '100%',
    backgroundColor: '#D4DBE2',
  },
  voteButtonReject: {
    flex: 1,
    backgroundColor: '#FD615B',
    transform: 'skewX(-30deg) translateX(4px)',
    borderRadius: 10,
    width: '100%',
    // borderTopLeftRadius: 44,
    // borderBottomLeftRadius: 44,
    // borderTopRightRadius: 6,
    // borderBottomRightRadius: 100,
    height: 44,
  },
  voteButtonAgree: {
    flex: 1,
    backgroundColor: '#1083FE',
    transform: 'skewX(-30deg)  translateX(-4px)',
  },
  skewButton: {
    position: 'relative',
    height: 44,
    flex: 1,
  },
  skewButtonBGRounded: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    borderRadius: 44,
    height: 44,
    flex: 1,
  },
  skewButtonBGSkew: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 10,
    width: '80%',
    height: 44,
    transform: 'skewX(-30deg)  translateX(-4px)',
  },
  voteActionBorder: {
    borderTopColor: '#D4DBE2',
    borderTopWidth: 0.5,
    borderStyle: 'solid',
  },
})

const voteStyles = StyleSheet.create({
  border: {
    borderWidth: 0.5,
    borderColor: '#d4dbe2',
    borderRadius: 12,
  },
  bar: {
    flex: 1,
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F1F3F5',
  },
  barInner: {
    height: '100%',
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
