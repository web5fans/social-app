import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Dimensions, Pressable, StyleSheet, View} from 'react-native'
import {Image} from 'expo-image'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useRequest} from 'ahooks'

import {emailRegExp, phoneNumberRegExp} from '#/lib/tools'
import {logger} from '#/logger'
import * as Toast from '#/view/com/util/Toast'
import QrScanner, {
  type QrScannerRefProps,
} from '#/screens/Profile/Header/QrScanner'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import * as TextField from '#/components/forms/TextField'
import {QrCode_Scan} from '#/components/icons/QrCode'
import {Text} from '#/components/Typography'
import server from '#/server'

const SCREEN_HEIGHT = Dimensions.get('window').height

export function SendPointsDialog({
  defaultReceive,
  control,
  onUpdate,
}: {
  defaultReceive?: string
  control: Dialog.DialogControlProps
  onUpdate?: () => void
}) {
  const {_} = useLingui()

  const searchParams = new URLSearchParams(window.location.search)
  const [receiveUser, setReceiveUser] = useState(
    searchParams.get('receiveUser') || '',
  )

  useEffect(() => {
    if (receiveUser && control) {
      control.open()
      const url = new URL(window.location.href)
      url.search = ''
      window.history.replaceState(null, '', url)
    }
  }, [receiveUser, control])

  const onPressCancel = useCallback(() => {
    control.close()
    setReceiveUser('')
  }, [control])

  return (
    <Dialog.Outer
      control={control}
      nativeOptions={{
        minHeight: SCREEN_HEIGHT,
      }}
      testID="sendPointsModal">
      <DialogInner
        onUpdate={onUpdate}
        defaultReceive={receiveUser}
        onPressCancel={onPressCancel}
      />
    </Dialog.Outer>
  )
}

function DialogInner({
  defaultReceive = '',
  onUpdate,
  onPressCancel,
}: {
  defaultReceive?: string
  onUpdate?: () => void
  onPressCancel: () => void
}) {
  const {_} = useLingui()
  const t = useTheme()
  const control = Dialog.useDialogContext()

  const videoRef = useRef<QrScannerRefProps>(null)

  const [giftAccount, setGiftAccount] = useState(defaultReceive)
  const [giftPoints, setGiftPoints] = useState('')

  const {data: userDetail} = useRequest(() =>
    server.dao('POST /user/login-user-detail'),
  )

  const onPressSave = useCallback(async () => {
    try {
      const flagRes = await server.dao(
        'POST /score/send',
        {
          userPhoneOrEmail: giftAccount,
          score: Number(giftPoints),
        },
        {getWholeBizData: true},
      )
      if (flagRes.data) {
        onUpdate?.()
        control.close()
        Toast.show('发送成功', 'check', 'center')
        return
      }
      Toast.show(flagRes.message, 'xmark', 'center')
    } catch (e: any) {
      logger.error('Failed to update user profile', {message: String(e)})
    }
  }, [onUpdate, control, giftAccount, giftPoints])

  const displayNameInvalid = useMemo(() => {
    if (!giftAccount) return false

    const regs = [emailRegExp, phoneNumberRegExp]
    for (const reg of regs) {
      if (reg.test(giftAccount)) return false
    }

    return true
  }, [giftAccount])

  const giftPointsInvalid = useMemo(() => {
    if (!giftPoints) return false
    const issNumber = /^[1-9]\d*$/.test(giftPoints)
    if (issNumber) {
      return Number(giftPoints) > (userDetail?.score || 0)
    }

    return !issNumber
  }, [giftPoints, userDetail])

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

  const scan = async () => {
    const qrResult = await videoRef?.current?.scan()
    if (!qrResult) return
    const url = new URL(qrResult)
    setGiftAccount(url.searchParams.get('receiveUser') || '')
  }

  return (
    <>
      <QrScanner ref={videoRef} />
      <Dialog.ScrollableInner
        label={_(msg`Edit profile`)}
        style={[a.overflow_hidden, {marginTop: 'calc(50vh - 40px - 170px)'}]}
        header={
          <Dialog.Header
            renderRight={cancelButton}
            style={[a.border_transparent]}>
            <Dialog.HeaderText>发送稻米</Dialog.HeaderText>
          </Dialog.Header>
        }>
        <View style={[a.gap_xl]}>
          <View style={styles.account}>
            <TextField.LabelText>手机号/邮箱</TextField.LabelText>
            <TextField.Root isInvalid={displayNameInvalid}>
              <Dialog.Input
                defaultValue={giftAccount}
                onChangeText={setGiftAccount}
                label={_(msg`Display name`)}
                placeholder={'请输入手机号/邮箱'}
                testID="editProfileDisplayNameInput"
              />
            </TextField.Root>
            <Pressable
              accessibilityRole={'button'}
              style={styles.scan}
              onPress={scan}>
              <QrCode_Scan fill={'#6F869F'} size={'md'} style={[a.z_10]} />
            </Pressable>
            {displayNameInvalid && (
              <TextField.SuffixText
                style={[
                  a.text_sm,
                  a.mt_xs,
                  a.font_bold,
                  {color: t.palette.negative_400},
                ]}
                label={'格式'}>
                请输入正确格式
              </TextField.SuffixText>
            )}
          </View>

          <View>
            <TextField.LabelText>稻米</TextField.LabelText>
            <TextField.Root isInvalid={giftPointsInvalid}>
              <Dialog.Input
                defaultValue={giftPoints}
                onChangeText={setGiftPoints}
                label={_(msg`Display name`)}
                placeholder={'请输入赠送稻米'}
                testID="editProfileDescriptionInput"
                inputMode={'numeric'}
              />
            </TextField.Root>
            {giftPointsInvalid && (
              <TextField.SuffixText
                style={[
                  a.text_sm,
                  a.mt_xs,
                  a.font_bold,
                  {color: t.palette.negative_400},
                ]}
                label={'格式'}>
                请输入正确格式
              </TextField.SuffixText>
            )}
          </View>
          <View style={[a.flex_row]}>
            <Text style={styles.cur_pints_label}>当前稻米：</Text>
            <Text style={styles.cur_pints_value}>{userDetail?.score}</Text>
          </View>
          <Button
            label={_(msg`Save`)}
            onPress={onPressSave}
            disabled={
              !giftAccount ||
              !giftPoints ||
              displayNameInvalid ||
              giftPointsInvalid
            }
            size="small"
            color="primary"
            variant="solid"
            style={[styles.confirm, a.rounded_sm]}
            testID="editProfileSaveBtn">
            <ButtonText style={[a.text_md]}>确认</ButtonText>
          </Button>
        </View>
      </Dialog.ScrollableInner>
    </>
  )
}

const styles = StyleSheet.create({
  account: {
    position: 'relative',
  },
  scan: {
    position: 'absolute',
    right: 0,
    top: 23,
    zIndex: 10,
    padding: 10,
  },
  cur_pints_label: {
    color: '#6F869F',
  },
  cur_pints_value: {
    color: '#42576C',
    fontWeight: 500,
  },
  confirm: {
    width: 76,
    margin: 'auto',
  },
})
