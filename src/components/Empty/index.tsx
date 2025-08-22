import {View} from 'react-native'
import {Image} from 'expo-image'

import {atoms as a, useTheme} from '#/alf'
import {Text} from '#/components/Typography'

const Empty = () => {
  return (
    <View
      style={[
        a.w_full,
        a.h_full,
        a.flex,
        a.flex_col,
        a.align_center,
        a.justify_center,
        {minHeight: 300},
      ]}>
      <Image
        accessibilityIgnoresInvertColors
        source={require('#/assets/empty.png')}
        style={{width: 135, height: 70, marginBottom: 15}}
      />
      <Text style={[a.text_sm, {color: '#42576C'}]}>空空如也~</Text>
    </View>
  )
}

export default Empty
