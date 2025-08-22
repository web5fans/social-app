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
import {isEmail, isPhoneNumber} from '#/lib/validator'
import {web} from '#/alf'
import {atoms as a, useTheme} from '#/alf'
import * as Dialog from '#/components/Dialog'
import * as TextField from '#/components/forms/TextField'
import {CheckThick_Stroke2_Corner0_Rounded as Check} from '#/components/icons/Check'
import {Envelope_Stroke2_Corner0_Rounded as Envelope} from '#/components/icons/Envelope'
import {ShieldCheck_Stroke2_Corner0_Rounded as Shield} from '#/components/icons/Shield'
import useSMS from '#/hooks/useSMS'
import server from '#/server'
import {Admonition} from '../Admonition'
import {Button, ButtonIcon, ButtonText} from '../Button'
import SettingsPhoneSvg from '../DAO/settings.phone'
import {ResendEmailText} from '../dialogs/EmailDialog/components/ResendEmailText'
import {Divider} from '../Divider'
import {Loader} from '../Loader'
import {Text} from '../Typography'

export type ContactModifyDialogProps = {
  afterUpdate?: () => void
}

export type ContactModifyDialogRef = {
  open: (field: 'phone' | 'email') => void
  close: () => void
}

const ContactModifyDialog = forwardRef<
  ContactModifyDialogRef,
  ContactModifyDialogProps
>(function ContactModifyDialog(props, ref) {
  const {afterUpdate} = props
  const t = useTheme()
  const {_} = useLingui()
  const control = Dialog.useDialogControl()
  const captchaAPI = useSMS()
  const [state, dispatch] = useReducer(reducer, {
    field: 'email',
    contactValue: '',
    valid: true,
    mutationStatus: 'default',
    error: '',
    smsCode: '',
  })

  const fieldTypeCN = state.field === 'email' ? '电子邮箱' : '手机号'
  useImperativeHandle(ref, () => {
    return {
      open(type: 'phone' | 'email') {
        dispatch({type: 'setField', value: type})
        control.open()
      },
      close() {
        control.close()
      },
    }
  })
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

  const handleUpdateEmail = async () => {
    dispatch({
      type: 'setMutationStatus',
      status: 'pending',
    })

    if (state.valid === false) {
      dispatch({
        type: 'setError',
        error: `${fieldTypeCN}格式不正确`,
      })
      return
    }
    // todo
    // if (state.email === currentAccount!.email) {
    //   dispatch({
    //     type: 'setError',
    //     error: _(msg`This email is already associated with your account.`),
    //   })
    //   return
    // }

    try {
      const modifyRes = await wait(
        1000,
        state.field === 'email'
          ? server.dao(
              'POST /user/modify-email-address',
              {email: state.contactValue, codeType: 4, code: state.smsCode},
              {getWholeBizData: true},
            )
          : server.dao(
              'POST /user/modify-phone',
              {
                phone: state.contactValue,
                phoneRegion: '86',
                codeType: 5,
                code: state.smsCode,
              },
              {getWholeBizData: true},
            ),
      )
      if (!modifyRes.data) {
        throw new Error(modifyRes.message)
      }
      dispatch({
        type: 'setMutationStatus',
        status: 'success',
      })
      afterUpdate?.()

      // try {
      //   // fire off a confirmation email immediately
      //   await requestEmailVerification()
      // } catch { }
    } catch (e: any) {
      // logger.error('EmailDialog: update email failed', { safeMessage: e })
      // const { clean } = cleanError(e)
      dispatch({
        type: 'setError',
        error: e.message || '更新失败 (#343)',
      })
    }
  }

  return (
    <Dialog.Outer control={control} onClose={onClose}>
      <Dialog.Handle />

      <Dialog.ScrollableInner
        label={`Make adjustments to ${state.field} settings for your account`}
        style={web({maxWidth: 400, marginTop: '25vh'})}>
        {/* <Inner control={emailDialogControl} /> */}
        <Dialog.Close />
        <View style={[a.gap_lg]}>
          <Text style={[a.text_xl, a.font_heavy]}>更新你的{fieldTypeCN}</Text>

          <View style={[a.gap_md]}>
            <View>
              <Text
                style={[a.pb_sm, a.leading_snug, t.atoms.text_contrast_medium]}>
                请输入你的新{fieldTypeCN}
              </Text>
              <TextField.Root>
                <TextField.Icon
                  icon={state.field === 'phone' ? SettingsPhoneSvg : Envelope}
                  iconProps={
                    state.field === 'phone'
                      ? {size: 20, inactiveColor: 'currentColor'}
                      : undefined
                  }
                />
                <TextField.Input
                  label={_(msg`New email address`)}
                  placeholder={`请输入你的新${fieldTypeCN}`}
                  defaultValue={state.contactValue}
                  onChangeText={
                    state.mutationStatus === 'success'
                      ? undefined
                      : value => dispatch({type: 'setContactValue', value})
                  }
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  // onSubmitEditing={handleUpdateEmail}
                />
              </TextField.Root>
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
                  onSubmitEditing={handleUpdateEmail}
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
                    captchaAPI
                      .send(state.contactValue, state.field === 'phone' ? 5 : 4)
                      .catch(e => {
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
              onPress={handleUpdateEmail}
              disabled={
                !state.contactValue ||
                !state.smsCode ||
                state.mutationStatus === 'pending'
              }>
              <ButtonText>更新{fieldTypeCN}</ButtonText>
              {state.mutationStatus === 'pending' && (
                <ButtonIcon icon={Loader} />
              )}
            </Button>
          )}
        </View>
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
})

export default ContactModifyDialog

type State = {
  field: 'phone' | 'email'
  mutationStatus: 'pending' | 'success' | 'error' | 'default'
  error: string
  contactValue: string
  valid: boolean
  smsCode: string
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
      type: 'setContactValue'
      value: string
    }
  | {
      type: 'setField'
      value: State['field']
    }
  | {
      type: 'setSmsCode'
      value: string
    }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setField': {
      return {
        ...state,
        field: action.value,
        contactValue: '',
        valid: false,
        smsCode: '',
      }
    }
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
    case 'setContactValue': {
      const isValid = (state.field === 'email' ? isEmail : isPhoneNumber)(
        action.value,
      )
      return {
        ...state,
        contactValue: action.value,
        // email: action.value,
        valid: isValid,
      }
    }
    case 'setField': {
      return {
        ...state,
        field: action.value,
      }
    }
  }
}
