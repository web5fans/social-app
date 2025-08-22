import React, {useCallback, useMemo} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {
  type AppBskyActorDefs,
  moderateProfile,
  type ModerationOpts,
  RichText as RichTextAPI,
} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useFocusEffect} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import {useRequest} from 'ahooks'

import {useOpenComposer} from '#/lib/hooks/useOpenComposer'
import {useSetTitle} from '#/lib/hooks/useSetTitle'
import {ComposeIcon2} from '#/lib/icons'
import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {combinedDisplayName} from '#/lib/strings/display-names'
import {cleanError} from '#/lib/strings/errors'
import {isInvalidHandle} from '#/lib/strings/handles'
import {colors, s} from '#/lib/styles'
import {useProfileShadow} from '#/state/cache/profile-shadow'
import {listenSoftReset} from '#/state/events'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useLabelerInfoQuery} from '#/state/queries/labeler'
import {resetProfilePostsQueries} from '#/state/queries/post-feed'
import {useProfileQuery} from '#/state/queries/profile'
import {useResolveDidQuery} from '#/state/queries/resolve-uri'
import {useAgent, useSession} from '#/state/session'
import {useSetMinimalShellMode} from '#/state/shell'
import {ProfileFeedgens} from '#/view/com/feeds/ProfileFeedgens'
import {ProfileLists} from '#/view/com/lists/ProfileLists'
import {PagerWithHeader} from '#/view/com/pager/PagerWithHeader'
import {ErrorScreen} from '#/view/com/util/error/ErrorScreen'
import {FAB} from '#/view/com/util/fab/FAB'
import {type ListRef} from '#/view/com/util/List'
import {ProfileHeader, ProfileHeaderLoading} from '#/screens/Profile/Header'
import {ProfileFeedSection} from '#/screens/Profile/Sections/Feed'
import {ProfileLabelsSection} from '#/screens/Profile/Sections/Labels'
import {ProfileTabsAll} from '#/screens/Profile/Tabs/All'
import SubBar from '#/screens/Profile/Tabs/SubBar'
import {atoms as a} from '#/alf'
import * as Layout from '#/components/Layout'
import {ScreenHider} from '#/components/moderation/ScreenHider'
import {ProfileStarterPacks} from '#/components/StarterPack/ProfileStarterPacks'
import {navigate} from '#/Navigation'
import server from '#/server'
import {ExpoScrollForwarderView} from '../../../modules/expo-scroll-forwarder'

interface SectionRef {
  scrollToTop: () => void
}

type Props = NativeStackScreenProps<CommonNavigatorParams, 'Profile'>
export function ProfileScreen(props: Props) {
  return (
    <Layout.Screen testID="profileScreen" style={[a.pt_0]}>
      <ProfileScreenInner {...props} />
    </Layout.Screen>
  )
}

function ProfileScreenInner({route}: Props) {
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const queryClient = useQueryClient()
  const name =
    route.params.name === 'me' ? currentAccount?.did : route.params.name
  const moderationOpts = useModerationOpts()
  const {
    data: resolvedDid,
    error: resolveError,
    refetch: refetchDid,
    isLoading: isLoadingDid,
  } = useResolveDidQuery(name)
  const {
    data: profile,
    error: profileError,
    refetch: refetchProfile,
    isLoading: isLoadingProfile,
    isPlaceholderData: isPlaceholderProfile,
  } = useProfileQuery({
    did: resolvedDid,
  })

  const onPressTryAgain = React.useCallback(() => {
    if (resolveError) {
      refetchDid()
    } else {
      refetchProfile()
    }
  }, [resolveError, refetchDid, refetchProfile])

  // Apply hard-coded redirects as need
  React.useEffect(() => {
    if (resolveError) {
      if (name === 'lulaoficial.bsky.social') {
        console.log('Applying redirect to lula.com.br')
        navigate('Profile', {name: 'lula.com.br'})
      }
    }
  }, [name, resolveError])

  // When we open the profile, we want to reset the posts query if we are blocked.
  React.useEffect(() => {
    if (resolvedDid && profile?.viewer?.blockedBy) {
      resetProfilePostsQueries(queryClient, resolvedDid)
    }
  }, [queryClient, profile?.viewer?.blockedBy, resolvedDid])

  // Most pushes will happen here, since we will have only placeholder data
  if (isLoadingDid || isLoadingProfile) {
    return (
      <Layout.Content>
        <ProfileHeaderLoading />
      </Layout.Content>
    )
  }
  if (resolveError || profileError) {
    return (
      <SafeAreaView style={[a.flex_1]}>
        <ErrorScreen
          testID="profileErrorScreen"
          title={profileError ? _(msg`Not Found`) : _(msg`Oops!`)}
          message={cleanError(resolveError || profileError)}
          onPressTryAgain={onPressTryAgain}
          showHeader
        />
      </SafeAreaView>
    )
  }
  if (profile && moderationOpts) {
    return (
      <ProfileScreenLoaded
        profile={profile}
        moderationOpts={moderationOpts}
        isPlaceholderProfile={isPlaceholderProfile}
        hideBackButton={!!route.params.hideBackButton}
      />
    )
  }
  // should never happen
  return (
    <SafeAreaView style={[a.flex_1]}>
      <ErrorScreen
        testID="profileErrorScreen"
        title="Oops!"
        message="Something went wrong and we're not sure what."
        onPressTryAgain={onPressTryAgain}
        showHeader
      />
    </SafeAreaView>
  )
}

function ProfileScreenLoaded({
  profile: profileUnshadowed,
  isPlaceholderProfile,
  moderationOpts,
  hideBackButton,
}: {
  profile: AppBskyActorDefs.ProfileViewDetailed
  moderationOpts: ModerationOpts
  hideBackButton: boolean
  isPlaceholderProfile: boolean
}) {
  const profile = useProfileShadow(profileUnshadowed)
  const {hasSession, currentAccount} = useSession()
  const setMinimalShellMode = useSetMinimalShellMode()
  const {openComposer} = useOpenComposer()
  const {
    data: labelerInfo,
    error: labelerError,
    isLoading: isLabelerLoading,
  } = useLabelerInfoQuery({
    did: profile.did,
    enabled: !!profile.associated?.labeler,
  })
  const [currentPage, setCurrentPage] = React.useState(0)
  const {_} = useLingui()

  const [scrollViewTag, setScrollViewTag] = React.useState<number | null>(null)

  const postsSectionRef = React.useRef<SectionRef>(null)
  const proposalSectionRef = React.useRef<SectionRef>(null)
  const taskSectionRef = React.useRef<SectionRef>(null)
  const productSectionRef = React.useRef<SectionRef>(null)
  const activitySectionRef = React.useRef<SectionRef>(null)
  const likesSectionRef = React.useRef<SectionRef>(null)
  const listsSectionRef = React.useRef<SectionRef>(null)
  const labelsSectionRef = React.useRef<SectionRef>(null)

  // useSetTitle(combinedDisplayName(profile))
  useSetTitle('个人中心')
  const {data: currentUserInfo} = useRequest(
    async () => {
      const res = await server.dao('POST /user/login-user-detail')
      return res
    },
    {
      ready: !!currentAccount?.did,
    },
  )

  const description = profile.description ?? ''
  const hasDescription = description !== ''
  const [descriptionRT, isResolvingDescriptionRT] = useRichText(description)
  const showPlaceholder = isPlaceholderProfile || isResolvingDescriptionRT
  const moderation = useMemo(
    () => moderateProfile(profile, moderationOpts),
    [profile, moderationOpts],
  )

  const isMe = profile.did === currentAccount?.did
  const hasLabeler = !!profile.associated?.labeler
  const showFiltersTab = hasLabeler
  const showPostsTab = true
  const showRepliesTab = hasSession
  const showMediaTab = !hasLabeler
  const showVideosTab = !hasLabeler
  const showLikesTab = isMe
  const starterPackCount = profile.associated?.starterPacks || 0
  // subtract starterpack count from list count, since starterpacks are a type of list
  const listCount = (profile.associated?.lists || 0) - starterPackCount
  const showListsTab = hasSession && (isMe || listCount > 0)

  const commonSections = ['全部', '任务', '商品', '活动']

  const sectionTitles =
    isMe && currentUserInfo?.nodeUser
      ? commonSections.concat(['提案'])
      : commonSections

  const scrollSectionToTop = useCallback((index: number) => {
    switch (index) {
      case 0:
        postsSectionRef.current?.scrollToTop()
        break
      case 1:
        taskSectionRef.current?.scrollToTop()
        break
      case 2:
        productSectionRef.current?.scrollToTop()
        break
      case 3:
        activitySectionRef.current?.scrollToTop()
        break
      case 4:
        proposalSectionRef.current?.scrollToTop()
        break
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setMinimalShellMode(false)
      return listenSoftReset(() => {
        scrollSectionToTop(currentPage)
      })
    }, [setMinimalShellMode, currentPage, scrollSectionToTop]),
  )

  // events
  // =

  const onPressCompose = () => {
    const mention =
      profile.handle === currentAccount?.handle ||
      isInvalidHandle(profile.handle)
        ? undefined
        : profile.handle
    openComposer({mention})
  }

  const onPageSelected = (i: number) => {
    setCurrentPage(i)
  }

  const onCurrentPageSelected = (index: number) => {
    scrollSectionToTop(index)
  }

  // rendering
  // =

  const renderHeader = ({
    setMinimumHeight,
  }: {
    setMinimumHeight: (height: number) => void
  }) => {
    return (
      <ExpoScrollForwarderView scrollViewTag={scrollViewTag}>
        <ProfileHeader
          profile={profile}
          labeler={labelerInfo}
          descriptionRT={hasDescription ? descriptionRT : null}
          moderationOpts={moderationOpts}
          hideBackButton={hideBackButton}
          isPlaceholderProfile={showPlaceholder}
          setMinimumHeight={setMinimumHeight}
        />
      </ExpoScrollForwarderView>
    )
  }

  return (
    <ScreenHider
      testID="profileView"
      style={styles.container}
      screenDescription={_(msg`profile`)}
      modui={moderation.ui('profileView')}>
      <PagerWithHeader
        testID="profilePager"
        isHeaderReady={!showPlaceholder}
        items={sectionTitles}
        onPageSelected={onPageSelected}
        onCurrentPageSelected={onCurrentPageSelected}
        renderHeader={renderHeader}
        allowHeaderOverScroll>
        {({headerHeight, isFocused, scrollElRef}) => (
          <SubBar
            items={[
              {
                key: `author|${profile.did}|`,
                label: '贴文',
              },
              {key: `author|${profile.did}|reply`, label: '回复'},
              {key: `author|${profile.did}|media`, label: '媒体'},
              {key: `likes|${profile.did}`, label: '喜欢'},
            ]}>
            <ProfileFeedSection
              ref={postsSectionRef}
              feed={`author|${profile.did}`}
              headerHeight={headerHeight}
              isFocused={isFocused}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={profile.did}
              setScrollViewTag={setScrollViewTag}
            />
          </SubBar>
        )}
        {({headerHeight, isFocused, scrollElRef}) => (
          <SubBar
            items={[
              {
                key: `author-tasks|${profile.did}|`,
                label: '贴文',
              },
              {key: `author-tasks|${profile.did}|reply`, label: '回复'},
              {key: `author-tasks|${profile.did}|media`, label: '媒体'},
              {key: `likes|${profile.did}|tasks`, label: '喜欢'},
            ]}>
            <ProfileFeedSection
              ref={taskSectionRef}
              feed={`author-tasks|${profile.did}`}
              headerHeight={headerHeight}
              isFocused={isFocused}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={profile.did}
              setScrollViewTag={setScrollViewTag}
            />
          </SubBar>
        )}
        {({headerHeight, isFocused, scrollElRef}) => (
          <SubBar
            items={[
              {
                key: `author-products|${profile.did}|`,
                label: '贴文',
              },
              {key: `author-products|${profile.did}|reply`, label: '回复'},
              {key: `author-products|${profile.did}|media`, label: '媒体'},
              {key: `likes|${profile.did}|products`, label: '喜欢'},
            ]}>
            <ProfileFeedSection
              ref={productSectionRef}
              feed={`author-products|${profile.did}`}
              headerHeight={headerHeight}
              isFocused={isFocused}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={profile.did}
              setScrollViewTag={setScrollViewTag}
            />
          </SubBar>
        )}
        {({headerHeight, isFocused, scrollElRef}) => (
          <SubBar
            items={[
              {
                key: `author-activity|${profile.did}|`,
                label: '贴文',
              },
              {key: `author-activity|${profile.did}|reply`, label: '回复'},
              {key: `author-activity|${profile.did}|media`, label: '媒体'},
              {key: `likes|${profile.did}|activity`, label: '喜欢'},
            ]}>
            <ProfileFeedSection
              ref={activitySectionRef}
              feed={`author-activity|${profile.did}`}
              headerHeight={headerHeight}
              isFocused={isFocused}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={profile.did}
              setScrollViewTag={setScrollViewTag}
            />
          </SubBar>
        )}
        {({headerHeight, isFocused, scrollElRef}) => (
          <SubBar
            items={[
              {
                key: `proposal|0|${profile.did}`,
                label: '全部',
              },
              {key: `proposal|1|${profile.did}`, label: '我发布的'},
              {key: `proposal|2|${profile.did}`, label: '我参与的'},
            ]}>
            <ProfileFeedSection
              ref={proposalSectionRef}
              feed={`author|${profile.did}|posts_and_author_threads`}
              headerHeight={headerHeight}
              isFocused={isFocused}
              scrollElRef={scrollElRef as ListRef}
              ignoreFilterFor={profile.did}
              setScrollViewTag={setScrollViewTag}
            />
          </SubBar>
        )}
        {/* {showListsTab && !profile.associated?.labeler
          ? ({ headerHeight, isFocused, scrollElRef }) => (
            <ProfileLists
              ref={listsSectionRef}
              did={profile.did}
              scrollElRef={scrollElRef as ListRef}
              headerOffset={headerHeight}
              enabled={isFocused}
              setScrollViewTag={setScrollViewTag}
            />
          )
          : null} */}
      </PagerWithHeader>
    </ScreenHider>
  )
}

function useRichText(text: string): [RichTextAPI, boolean] {
  const agent = useAgent()
  const [prevText, setPrevText] = React.useState(text)
  const [rawRT, setRawRT] = React.useState(() => new RichTextAPI({text}))
  const [resolvedRT, setResolvedRT] = React.useState<RichTextAPI | null>(null)
  if (text !== prevText) {
    setPrevText(text)
    setRawRT(new RichTextAPI({text}))
    setResolvedRT(null)
    // This will queue an immediate re-render
  }
  React.useEffect(() => {
    let ignore = false
    async function resolveRTFacets() {
      // new each time
      const resolvedRT = new RichTextAPI({text})
      await resolvedRT.detectFacets(agent)
      if (!ignore) {
        setResolvedRT(resolvedRT)
      }
    }
    resolveRTFacets()
    return () => {
      ignore = true
    }
  }, [text, agent])
  const isResolving = resolvedRT === null
  return [resolvedRT ?? rawRT, isResolving]
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
    // @ts-ignore Web-only.
    overflowAnchor: 'none', // Fixes jumps when switching tabs while scrolled down.
  },
  loading: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  emptyState: {
    paddingVertical: 40,
  },
  loadingMoreFooter: {
    paddingVertical: 20,
  },
  endItem: {
    paddingTop: 20,
    paddingBottom: 30,
    color: colors.gray5,
    textAlign: 'center',
  },
})
