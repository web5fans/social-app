import {View} from 'react-native'
import {Image} from 'expo-image'

import {atoms as a, useTheme} from '#/alf'
import {Text} from '#/components/Typography'

const MedalEmpty = () => {
  return (
    <View
      style={[
        a.w_full,
        a.h_full,
        a.flex,
        a.flex_col,
        a.align_center,
        a.justify_center,
      ]}>
      <Image
        accessibilityIgnoresInvertColors
        source={require('#/assets/empty.png')}
        style={{width: 135, height: 70, marginBottom: 15}}
      />
      <Text style={[a.text_sm, {color: '#42576C'}]}>快去获得吧~</Text>
    </View>
  )
}

export default MedalEmpty
