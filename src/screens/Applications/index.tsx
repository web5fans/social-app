import {View} from 'react-native'
import {Image} from 'expo-image'

import {HomeHeaderLayoutMobile} from '#/view/com/home/HomeHeaderLayoutMobile'
import {atoms as a} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'

export default function ApplicationsScreen() {
  return (
    <Layout.Screen
      testID="ApplicationsScreen"
      style={{backgroundColor: '#F8FAFC'}}>
      <HomeHeaderLayoutMobile
        tabBarAnchor={null}
        // transparent
        // style={[{ backgroundColor: `rgba(255, 255, 255, ${headerOpacity})` }]}
      />
      <View
        style={[
          a.flex_col,
          a.justify_center,
          a.align_center,
          {paddingTop: '40vh', gap: 14},
        ]}>
        <Image
          accessibilityIgnoresInvertColors
          style={{width: 100, height: 100}}
          source={require('#/assets/in-process.svg')}
        />
        <Text style={[a.text_sm, {color: '#42576C'}]}>敬请期待</Text>
      </View>
    </Layout.Screen>
  )
}
