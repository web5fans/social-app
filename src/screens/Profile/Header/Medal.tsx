import {
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {Image} from 'expo-image'
import {type AppBskyActorDefs} from '@atproto/api'
import {useNavigation} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import {type NavigationProp} from '#/lib/routes/types'
import {type Shadow} from '#/state/cache/types'
import {atoms as a, useTheme, web} from '#/alf'
import {ArrowRight_Angle} from '#/components/icons/Arrow'
import OssImage from '#/components/OssImage'
import {Text} from '#/components/Typography'
import server from '#/server'

export function ProfileHeaderMedal({
  profile,
}: {
  profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>
}) {
  const t = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const {data: medals} = useRequest(async () => {
    const result = await server.dao('POST /user-medal/page', {
      pageNum: 1,
      pageSize: 3,
      domainName: profile.handle,
    })
    return {
      data: result?.items.filter(m => !!m.getTime),
      totoal: result?.total,
    }
  })

  return (
    <Pressable
      onPress={() => {
        navigation.push('MedalsWall', {name: profile.handle})
      }}
      testID={'profileModal'}
      accessibilityLabel={''}
      accessibilityHint=""
      accessibilityLabelledBy="list-description"
      style={[
        a.flex_row,
        a.align_center,
        a.gap_2xs,
        a.px_xs,
        a.py_2xs,
        styles.medalBox,
      ]}>
      <Image
        source={require('#/assets/medals/medal-icon.png')}
        style={{width: 20, height: 20}}
      />
      <Text style={[a.text_md, t.atoms.text_contrast_medium]}>勋章</Text>
      <View style={[a.flex_row, a.gap_2xs, a.align_center]}>
        {medals?.data?.map(md => {
          return (
            <OssImage
              key={md.medalId}
              style={[{width: 16}, {aspectRatio: 1}]}
              attachId={md.attachId}
            />
          )
        })}
      </View>
      <Text
        style={[a.text_sm, t.atoms.text_contrast_medium, {color: '#6F869F'}]}>
        {medals?.totoal ?? 0}枚
      </Text>
      <ArrowRight_Angle fill={'#6F869F'} style={[a.ml_xs]} size={'xs'} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  medalBox: {
    borderRadius: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F3F5',
    marginBottom: 4,
    marginTop: 7,
  },
})
