import {useCallback} from 'react'
import {Dimensions, Pressable, StyleSheet, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import {Image} from 'expo-image'
import {type AppBskyActorDefs} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useRequest} from 'ahooks'

import * as Toast from '#/view/com/util/Toast'
import {atoms as a, useTheme} from '#/alf'
import * as Dialog from '#/components/Dialog'
import {Text} from '#/components/Typography'
import server from '#/server'

const SCREEN_HEIGHT = Dimensions.get('window').height

export function ReceivePointsDialog({
  profile,
  control,
  onUpdate,
}: {
  control: Dialog.DialogControlProps
  onUpdate?: () => void
}) {
  const {_} = useLingui()

  const onPressCancel = useCallback(() => {
    // Toast.show('接收成功', 'check', 'center')
    onUpdate?.()
    control.close()
  }, [control, onUpdate])

  return (
    <Dialog.Outer
      control={control}
      nativeOptions={{
        minHeight: SCREEN_HEIGHT,
      }}
      testID="sendPointsModal">
      <DialogInner
        profile={profile}
        onUpdate={onUpdate}
        onPressCancel={onPressCancel}
      />
    </Dialog.Outer>
  )
}

function DialogInner({
  profile = {},
  onUpdate,
  onPressCancel,
}: {
  profile: AppBskyActorDefs.ProfileViewDetailed
  onUpdate?: () => void
  onPressCancel: () => void
}) {
  const {_} = useLingui()

  const {data: userDetail} = useRequest(() =>
    server.dao('POST /user/login-user-detail'),
  )

  const cancelButton = useCallback(
    () => (
      <Pressable
        accessibilityRole={'button'}
        style={[{marginRight: 15}]}
        onPress={onPressCancel}>
        <Image
          accessibilityIgnoresInvertColors
          source={require('#/assets/close.svg')}
          alt="close"
          style={[{width: 16, height: 16}]}
        />
      </Pressable>
    ),
    [onPressCancel],
  )

  const qrLink =
    window.location.origin +
    `/middle-page?receiveUser=${userDetail?.phone || userDetail?.email}`

  return (
    <Dialog.ScrollableInner
      label={_(msg`Receive Points`)}
      style={[a.overflow_hidden, {marginTop: 'calc(50vh - 40px - 170px)'}]}
      header={
        <Dialog.Header
          renderRight={cancelButton}
          style={[a.border_transparent]}>
          <Dialog.HeaderText>接收稻米</Dialog.HeaderText>
        </Dialog.Header>
      }>
      <View style={[a.flex_row, a.justify_center]}>
        <View style={[styles.qrcode_wrap, a.border]}>
          <View
            style={[
              styles.qrcode_inner,
              a.flex_row,
              a.align_center,
              a.justify_center,
            ]}>
            <QRCode
              size={110}
              value={qrLink}
              logo={require('#/assets/logo.png')}
              logoSize={25}
              logoBorderRadius={4}
              logoBackgroundColor="transparent"
            />
          </View>
        </View>
      </View>
      <Text style={[a.mt_md, a.text_center, a.font_bold, {color: '#42576C'}]}>
        接收码
      </Text>
    </Dialog.ScrollableInner>
  )
}

const styles = StyleSheet.create({
  qrcode_wrap: {
    width: 170,
    height: 170,
    borderRadius: 12,
    borderColor: '#D4DBE2',
    backgroundColor: '#F1F3F5',
    padding: 13,
  },
  qrcode_inner: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
})
