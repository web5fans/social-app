import React, {useEffect} from 'react'
import {
  Image as RNImage,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {Image} from 'expo-image'
import {useNavigation, useRoute} from '@react-navigation/native'
import {useRequest} from 'ahooks'

import displayNumber from '#/lib/displayNumber'
import {type NavigationProp} from '#/lib/routes/types'
import {ReceivePointsDialog} from '#/screens/Profile/Header/ReceivePointsDialog'
import {SendPointsDialog} from '#/screens/Profile/Header/SendPointsDialog'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {useDialogControl} from '#/components/Dialog'
import {ArrowRight_Angle} from '#/components/icons/Arrow'
import {QrCode_Icon, QrCode_Scan} from '#/components/icons/QrCode'
import {Text} from '#/components/Typography'
import server from '#/server'

export function ProfileHeaderRewardPoints() {
  const t = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const sendPointsControl = useDialogControl()
  const receivePointsControl = useDialogControl()
  const route = useRoute()
  const {gtMobile} = useBreakpoints()

  const {data: userDetail, refresh} = useRequest(
    () => server.dao('POST /user/login-user-detail'),
    {
      manual: true,
    },
  )

  useEffect(() => {
    if (!route) return
    refresh()
  }, [route, refresh])

  return (
    <View style={[styles.container, [a.mt_md, a.px_lg, a.py_xl]]}>
      <Image
        accessibilityIgnoresInvertColors
        source={
          gtMobile
            ? require('./assets/points_bg.web.png')
            : require('./assets/points_bg.png')
        }
        style={[StyleSheet.absoluteFillObject, {left: -5, right: -5}]}
        contentFit={'fill'}
      />
      <View>
        <Text style={[t.atoms.text_inverted]}>稻米</Text>
        <View style={[a.mt_md, a.flex_row, a.align_center]}>
          <Text
            style={[
              a.text_family_ddin,
              a.font_bold,
              a.text_2xl,
              t.atoms.text_inverted,
            ]}>
            {displayNumber(userDetail?.score)}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => {}}>
            <View style={[a.flex_row, a.align_center, a.ml_md]}>
              <TouchableWithoutFeedback
                accessibilityRole="button"
                onPress={() => navigation.push('PointsRecord')}>
                <Text style={[styles.textStyle, t.atoms.text_inverted]}>
                  明细
                </Text>
              </TouchableWithoutFeedback>
              <ArrowRight_Angle
                fill={'#6F869F'}
                style={[a.ml_xs]}
                size={'xs'}
              />
            </View>
          </Pressable>
        </View>
      </View>
      <View style={[a.flex_row, a.align_center, a.gap_lg]}>
        <TouchableWithoutFeedback
          accessibilityRole="button"
          onPress={() => sendPointsControl.open()}>
          <View style={[a.flex_col, a.align_center]}>
            <View style={[styles.circle, a.mb_sm]}>
              <QrCode_Scan size={'md'} fill={'#fff'} />
            </View>
            <Text
              style={[
                styles.textStyle,
                t.atoms.text_inverted,
                a.user_select_none,
              ]}>
              发送稻米
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <SendPointsDialog control={sendPointsControl} onUpdate={refresh} />
        <TouchableWithoutFeedback
          accessibilityRole="button"
          onPress={() => receivePointsControl.open()}>
          <View style={[a.flex_col, a.align_center]}>
            <View style={[styles.circle, a.mb_sm]}>
              <QrCode_Icon size={'md'} />
            </View>
            <Text style={[styles.textStyle, t.atoms.text_inverted]}>
              接收稻米
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <ReceivePointsDialog
          control={receivePointsControl}
          onUpdate={refresh}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    opacity: 0.7,
    cursor: 'pointer',
  },
})
