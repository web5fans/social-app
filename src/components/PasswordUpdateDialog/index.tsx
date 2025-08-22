import {
  forwardRef,
  ReactElement,
  useCallback,
  useImperativeHandle,
  useReducer,
  useState,
} from 'react'
import {Pressable, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {wait} from '#/lib/async/wait'
import {useCleanError} from '#/lib/hooks/useCleanError'
import {checkPassword} from '#/lib/strings/password'
import {isEmail, isPhoneNumber} from '#/lib/validator'
import * as Toast from '#/view/com/util/Toast'
import {web} from '#/alf'
import {atoms as a, useTheme} from '#/alf'
import * as Dialog from '#/components/Dialog'
import * as TextField from '#/components/forms/TextField'
import {At_Stroke2_Corner0_Rounded as At} from '#/components/icons/At'
import {CheckThick_Stroke2_Corner0_Rounded as Check} from '#/components/icons/Check'
import {Envelope_Stroke2_Corner0_Rounded as Envelope} from '#/components/icons/Envelope'
import {Lock_Stroke2_Corner0_Rounded as Lock} from '#/components/icons/Lock'
import {ShieldCheck_Stroke2_Corner0_Rounded as Shield} from '#/components/icons/Shield'
import useSMS from '#/hooks/useSMS'
import server from '#/server'
import {Admonition} from '../Admonition'
import {Button, ButtonIcon, ButtonText} from '../Button'
import {ResendEmailText} from '../dialogs/EmailDialog/components/ResendEmailText'
import {Divider} from '../Divider'
import {Loader} from '../Loader'
import {Text} from '../Typography'

export type PasswordUpdateDialogProps = {
  afterUpdate?: () => void
  control: Dialog.DialogControlProps
  contact: string | undefined
  contactType: 'phone' | 'email'
}

export default function PasswordUpdateDialog(props: PasswordUpdateDialogProps) {
  const {afterUpdate, control, contact, contactType} = props
  const t = useTheme()
  const {_} = useLingui()
  // const control = Dialog.useDialogControl()
  const captchaAPI = useSMS()
  const [state, dispatch] = useReducer(reducer, {
    mutationStatus: 'default',
    error: '',
    smsCode: '',
    password: '',
  })

  const isPhone = contactType === 'phone'

  // const emailDialogControl = useEmailDialogControl()
  // const { isEmailVerified } = useAccountEmailState()
  const onClose = useCallback(() => {
    // if (!isEmailVerified) {
    //   if (emailDialogControl.value?.id === ScreenID.Verify) {
    //     emailDialogControl.value.onCloseWithoutVerifying?.()
    //   }
    // }
    // control.close()
  }, [])

  const onSubmitUpdate = async () => {
    dispatch({
      type: 'setMutationStatus',
      status: 'pending',
    })
    const passValidate = checkPassword(state.password)
    if (passValidate.type !== 'VALID') {
      dispatch({
        type: 'setError',
        error: passValidate.message,
      })
      return
    }

    try {
      const updateRes = await server.dao(
        'POST /user/reset-password',
        {
          email: !isPhone ? contact! : '',
          phone: isPhone ? contact! : '',
          phoneRegion: '86',
          verifyCode: state.smsCode,
          password: state.password,
          resetPasswordType: isPhone ? 2 : 1,
        },
        {getWholeBizData: true},
      )
      // const modifyRes = await wait(
      //   1000,
      //   state.field === 'email'
      //     ? server.dao(
      //         'POST /user/modify-email-address',
      //         {email: state.contactValue, codeType: 4, code: state.smsCode},
      //         {getWholeBizData: true},
      //       )
      //     : server.dao(
      //         'POST /user/modify-phone',
      //         {
      //           phone: state.contactValue,
      //           phoneRegion: '86',
      //           codeType: 5,
      //           code: state.smsCode,
      //         },
      //         {getWholeBizData: true},
      //       ),
      // )
      if (!updateRes.data) {
        throw new Error(updateRes.message)
      }
      Toast.show('密码更新成功，请重新登录', 'check', 'center')
      dispatch({
        type: 'setMutationStatus',
        status: 'success',
      })
      setTimeout(() => {
        afterUpdate?.()
      }, 3000)

      // try {
      //   // fire off a confirmation email immediately
      //   await requestEmailVerification()
      // } catch { }
    } catch (e: any) {
      // logger.error('EmailDialog: update email failed', { safeMessage: e })
      // const { clean } = cleanError(e)
      dispatch({
        type: 'setError',
        error: e.message || '更新失败 (#344)',
      })
    }
  }

  if (!contact) return null

  return (
    <Dialog.Outer control={control} onClose={onClose}>
      <Dialog.Handle />

      <Dialog.ScrollableInner
        label="更新密码"
        style={web({maxWidth: 400, marginTop: '25vh'})}>
        {/* <Inner control={emailDialogControl} /> */}
        <Dialog.Close />
        <View style={[a.gap_lg]}>
          <Text style={[a.text_xl, a.font_heavy]}>更新密码</Text>

          <View style={[a.gap_md]}>
            <View>
              <TextField.LabelText>验证码将发至: {contact}</TextField.LabelText>
              <View style={{height: 8}} />
              <TextField.Root>
                <TextField.Icon icon={Shield} />
                <TextField.Input
                  label="captcha code"
                  placeholder="请输入验证码"
                  defaultValue=""
                  onChangeText={
                    state.mutationStatus === 'success'
                      ? undefined
                      : value => dispatch({type: 'setSmsCode', value})
                  }
                  keyboardType="number-pad"
                  // autoComplete="email"
                  autoCapitalize="none"
                />
                <Button
                  testID="sendCaptchaButton"
                  // onPress={onPressForgotPassword}
                  label="发送验证码"
                  accessibilityHint={_(msg`send sms code`)}
                  variant="solid"
                  // color="secondary"
                  style={[
                    a.rounded_sm,
                    // t.atoms.bg_contrast_100,
                    {marginLeft: 'auto', left: 6, padding: 6},
                    a.z_10,
                  ]}
                  onPress={() => {
                    if (captchaAPI.ticking) return
                    captchaAPI.send(contact, 2).catch(e => {
                      dispatch({
                        type: 'setError',
                        error: e.message,
                      })
                    })
                  }}>
                  <ButtonText
                    style={{color: captchaAPI.ticking ? '#6F869F' : '#1083FE'}}>
                    {captchaAPI.countdownText || '发送验证码'}
                  </ButtonText>
                </Button>
              </TextField.Root>
              <View style={{height: 8}} />
              <TextField.Root>
                <TextField.Icon icon={Lock} />
                <TextField.Input
                  testID="passwordInput"
                  // inputRef={passwordInputRef}
                  // onChangeText={value => {
                  //   passwordValueRef.current = value
                  //   if (state.errorField === 'password' && value.length >= 8) {
                  //     dispatch({ type: 'clearError' })
                  //   }
                  // }}
                  onChangeText={
                    state.mutationStatus === 'success'
                      ? undefined
                      : value => dispatch({type: 'setPassword', value})
                  }
                  label={_(msg`Choose your password`)}
                  // defaultValue={state.password}
                  secureTextEntry
                  autoComplete="new-password"
                  autoCapitalize="none"
                  returnKeyType="next"
                  // submitBehavior={native('blurAndSubmit')}
                  onSubmitEditing={onSubmitUpdate}
                  passwordRules="minlength: 8;"
                />
              </TextField.Root>
            </View>

            {state.error && <Admonition type="error">{state.error}</Admonition>}
          </View>
          {state.mutationStatus === 'success' ? (
            <>
              <Divider />
              <View style={[a.gap_sm]}>
                <View style={[a.flex_row, a.gap_sm, a.align_center]}>
                  <Check fill={t.palette.positive_600} size="xs" />
                  <Text style={[a.text_md, a.font_heavy]}>
                    <Trans>Success!</Trans>
                  </Text>
                </View>
                {/* <Text style={[a.leading_snug]}>
                  <Trans>
                    Please click on the link in the email we just sent you to verify
                    your new email address. This is an important step to allow you
                    to continue enjoying all the features of Bluesky.
                  </Trans>
                </Text> */}
              </View>
            </>
          ) : (
            <Button
              label={_(msg`Update email`)}
              size="large"
              variant="solid"
              color="primary"
              onPress={onSubmitUpdate}
              disabled={
                !state.password ||
                !state.smsCode ||
                state.mutationStatus === 'pending'
              }>
              <ButtonText>更新密码</ButtonText>
              {state.mutationStatus === 'pending' && (
                <ButtonIcon icon={Loader} />
              )}
            </Button>
          )}
        </View>
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
}

type State = {
  mutationStatus: 'pending' | 'success' | 'error' | 'default'
  error: string
  smsCode: string
  password: string
  // email: string
  // token: string
}

type Action =
  | {
      type: 'setError'
      error: string
    }
  | {
      type: 'setMutationStatus'
      status: State['mutationStatus']
    }
  | {
      type: 'setPassword'
      value: string
    }
  | {
      type: 'setSmsCode'
      value: string
    }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setSmsCode': {
      return {
        ...state,
        smsCode: action.value,
      }
    }
    case 'setError': {
      return {
        ...state,
        error: action.error,
        mutationStatus: 'error',
      }
    }
    case 'setMutationStatus': {
      return {
        ...state,
        error: '',
        mutationStatus: action.status,
      }
    }
    case 'setPassword': {
      return {
        ...state,
        password: action.value,
      }
    }
  }
}
