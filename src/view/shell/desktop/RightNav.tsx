import {useEffect, useState} from 'react'
import {View} from 'react-native'
import {Image} from 'expo-image'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/core'

import {
  CONTACT_EMAIL,
  FEEDBACK_FORM_URL,
  HELP_DESK_URL,
  PRIVACY_PROTOCOL_FILE_URL,
  SERVICE_PROTOCOL_FILE_URL,
} from '#/lib/constants'
import {useKawaiiMode} from '#/state/preferences/kawaii'
import {useSession} from '#/state/session'
import {DesktopFeeds} from '#/view/shell/desktop/Feeds'
import {DesktopSearch} from '#/view/shell/desktop/Search'
import {SidebarTrendingTopics} from '#/view/shell/desktop/SidebarTrendingTopics'
import {
  atoms as a,
  useGutters,
  useLayoutBreakpoints,
  useTheme,
  web,
} from '#/alf'
import {AppLanguageDropdown} from '#/components/AppLanguageDropdown'
import {Divider} from '#/components/Divider'
import {CENTER_COLUMN_OFFSET} from '#/components/Layout'
import {InlineLinkText} from '#/components/Link'
import {ProgressGuideList} from '#/components/ProgressGuide/List'
import {Text} from '#/components/Typography'

function useWebQueryParams() {
  const navigation = useNavigation()
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    return navigation.addListener('state', e => {
      try {
        const {state} = e.data
        const lastRoute = state.routes[state.routes.length - 1]
        setParams(lastRoute.params)
      } catch (err) {}
    })
  }, [navigation, setParams])

  return params
}

export function DesktopRightNav({routeName}: {routeName: string}) {
  const t = useTheme()
  const {_} = useLingui()
  const {hasSession, currentAccount} = useSession()
  const kawaii = useKawaiiMode()
  const gutters = useGutters(['base', 0, 'base', 'wide'])
  const isSearchScreen = routeName === 'Search'
  // const webqueryParams = useWebQueryParams()
  // const searchQuery = webqueryParams?.q
  // const showTrending = !isSearchScreen || (isSearchScreen && !!searchQuery)
  const {rightNavVisible, centerColumnOffset, leftNavMinimal} =
    useLayoutBreakpoints()

  if (!rightNavVisible) {
    return null
  }

  const width = centerColumnOffset ? 250 : 300

  return (
    <View
      style={[
        gutters,
        a.gap_lg,
        web({
          position: 'fixed',
          left: '50%',
          transform: [
            {
              translateX: 300 + (centerColumnOffset ? CENTER_COLUMN_OFFSET : 0),
            },
            ...a.scrollbar_offset.transform,
          ],
          width: width + gutters.paddingLeft,
          maxHeight: '100%',
          overflowY: 'auto',
        }),
      ]}>
      {!isSearchScreen && <DesktopSearch />}

      {/* {hasSession && (
        <>
          <ProgressGuideList />
          <DesktopFeeds />
          <Divider />
        </>
      )} */}

      {/* {showTrending && <SidebarTrendingTopics />} */}

      <Text style={[a.leading_snug, t.atoms.text_contrast_low]}>
        {/*{hasSession && (*/}
        {/*  <>*/}
        {/*    <InlineLinkText*/}
        {/*      to={FEEDBACK_FORM_URL({*/}
        {/*        email: currentAccount?.email,*/}
        {/*        handle: currentAccount?.handle,*/}
        {/*      })}*/}
        {/*      label={_(msg`Feedback`)}>*/}
        {/*      {_(msg`Feedback`)}*/}
        {/*    </InlineLinkText>*/}
        {/*    {' • '}*/}
        {/*  </>*/}
        {/*)}*/}
        <InlineLinkText
          to={PRIVACY_PROTOCOL_FILE_URL} // "https://bsky.social/about/support/privacy-policy"
          label="隐私政策">
          隐私政策
        </InlineLinkText>
        {' • '}
        <InlineLinkText to={SERVICE_PROTOCOL_FILE_URL} label="服务条款">
          服务条款
        </InlineLinkText>
        {/* {' • '} */}
        {/*<InlineLinkText label={_(msg`Help`)} to={HELP_DESK_URL}>*/}
        {/*  {_(msg`Help`)}*/}
        {/*</InlineLinkText>*/}
      </Text>

      <View style={{height: 1, backgroundColor: '#D4DBE2', width: '100%'}} />
      <View style={[a.flex_1]}>
        <View style={[a.mb_xs]}>
          <Text>联系邮箱：</Text>
        </View>
        <View style={[a.flex_row, a.gap_xs, a.align_center]}>
          <Image
            source={require('#/assets/envelope.svg')}
            style={{width: 14, height: 14}}
          />
          <InlineLinkText
            to={`mailto:${CONTACT_EMAIL}`}
            style={[a.text_sm, {lineHeight: '18px', color: '#6F869F'}]}>
            {CONTACT_EMAIL}
          </InlineLinkText>
        </View>
      </View>
      <View style={{height: 1, backgroundColor: '#D4DBE2', width: '100%'}} />
      <View style={[a.flex_1]}>
        <Text style={[a.text_xs, {lineHeight: '18px', color: '#6F869F'}]}>
          Powered by Web5
        </Text>
      </View>

      {/* {!hasSession && leftNavMinimal && (
        <View style={[a.w_full, { height: 32 }]}>
          <AppLanguageDropdown />
        </View>
      )} */}
    </View>
  )
}
