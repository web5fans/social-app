import React, {useRef} from 'react'
import {type TextInput, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import * as EmailValidator from 'email-validator'
import type tldts from 'tldts'

import {
  PRIVACY_PROTOCOL_FILE_URL,
  SERVICE_PROTOCOL_FILE_URL,
} from '#/lib/constants'
import {isEmailMaybeInvalid} from '#/lib/strings/email'
import {isPhoneNumber, validateAccount} from '#/lib/validator'
import {logger} from '#/logger'
import {ScreenTransition} from '#/screens/Login/ScreenTransition'
import {useSignupContext} from '#/screens/Signup/state'
import {Policies} from '#/screens/Signup/StepInfo/Policies'
import {atoms as a, native} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as DateField from '#/components/forms/DateField'
import {type DateFieldRef} from '#/components/forms/DateField/types'
import {FormError} from '#/components/forms/FormError'
// import {HostingProvider} from '#/components/forms/HostingProvider'
import * as TextField from '#/components/forms/TextField'
import {At_Stroke2_Corner0_Rounded as At} from '#/components/icons/At'
import {Envelope_Stroke2_Corner0_Rounded as Envelope} from '#/components/icons/Envelope'
import {Lock_Stroke2_Corner0_Rounded as Lock} from '#/components/icons/Lock'
import {ShieldCheck_Stroke2_Corner0_Rounded as Shield} from '#/components/icons/Shield'
import {Ticket_Stroke2_Corner0_Rounded as Ticket} from '#/components/icons/Ticket'
import {Loader} from '#/components/Loader'
import useSMS from '#/hooks/useSMS'
import server from '#/server'
import {BackNextButtons} from '../BackNextButtons'

function sanitizeDate(date: Date): Date {
  if (!date || date.toString() === 'Invalid Date') {
    logger.error(`Create account: handled invalid date for birthDate`, {
      hasDate: !!date,
    })
    return new Date()
  }
  return date
}

export function StepInfo({
  onPressBack,
  isServerError,
  refetchServer,
  isLoadingStarterPack,
}: {
  onPressBack: () => void
  isServerError: boolean
  refetchServer: () => void
  isLoadingStarterPack: boolean
}) {
  const {_} = useLingui()
  const {state, dispatch} = useSignupContext()

  const inviteCodeValueRef = useRef<string>(state.inviteCode)
  const emailValueRef = useRef<string>(state.email)
  const prevEmailValueRef = useRef<string>(state.email)
  const passwordValueRef = useRef<string>(state.password)
  const captchaValueRef = useRef<string>(state.captcha)
  const captchaAPI = useSMS()

  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const captchaInputRef = useRef<TextInput>(null)
  const birthdateInputRef = useRef<DateFieldRef>(null)
  const [presubmitLoading, setPresubmitLoading] = React.useState<boolean>(false)

  const [hasWarnedEmail, setHasWarnedEmail] = React.useState<boolean>(false)

  const tldtsRef = React.useRef<typeof tldts>()
  React.useEffect(() => {
    // @ts-expect-error - valid path
    import('tldts/dist/index.cjs.min.js').then(tldts => {
      tldtsRef.current = tldts
    })
    // This will get used in the avatar creator a few steps later, so lets preload it now
    // @ts-expect-error - valid path
    import('react-native-view-shot/src/index')
  }, [])

  const onNextPress = async () => {
    const inviteCode = inviteCodeValueRef.current
    const email = emailValueRef.current
    const emailChanged = prevEmailValueRef.current !== email
    const password = passwordValueRef.current
    const captchaCode = captchaValueRef.current

    // if (!is13(state.dateOfBirth)) {
    //   return
    // }

    if (state.serviceDescription?.inviteCodeRequired && !inviteCode) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please enter your invite code.`),
        field: 'invite-code',
      })
    }
    if (!email) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please enter your email.`),
        field: 'email',
      })
    }
    if (!validateAccount(email)) {
      return dispatch({
        type: 'setError',
        value: _(msg`Your email appears to be invalid.`),
        field: 'email',
      })
    }
    // if (emailChanged && tldtsRef.current) {
    //   if (isEmailMaybeInvalid(email, tldtsRef.current)) {
    //     prevEmailValueRef.current = email
    //     setHasWarnedEmail(true)
    //     return dispatch({
    //       type: 'setError',
    //       value: _(
    //         msg`Please double-check that you have entered your email address correctly.`,
    //       ),
    //     })
    //   }
    // } else if (hasWarnedEmail) {
    //   setHasWarnedEmail(false)
    // }
    prevEmailValueRef.current = email

    if (!captchaCode) {
      return dispatch({
        type: 'setError',
        value: '请输入验证码',
        field: 'captcha',
      })
    }

    if (!password) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please choose your password.`),
        field: 'password',
      })
    }

    if (password.length < 8) {
      return dispatch({
        type: 'setError',
        value: _(msg`Your password must be at least 8 characters long.`),
        field: 'password',
      })
    }
    const isPhone = isPhoneNumber(email)
    // dispatch({ type: 'setIsLoading', value: true })
    setPresubmitLoading(true)
    const resData = await server.dao(
      'POST /user/pre-register',
      {
        registerType: isPhone ? 2 : 1,
        phone: isPhone ? email : '',
        email: !isPhone ? email : '',
        phoneRegion: '86',
        verifyCode: captchaCode,
      },
      {getWholeBizData: true},
    )
    setPresubmitLoading(false)
    const registerUserId = resData.data
    // dispatch({ type: 'setIsLoading', value: false })
    if (!registerUserId) {
      return dispatch({
        type: 'setError',
        value: resData.message || '注册失败，请稍后再试(#0001)',
      })
    }

    dispatch({type: 'setRegisterId', value: registerUserId})
    dispatch({type: 'setInviteCode', value: inviteCode})
    dispatch({type: 'setEmail', value: email})
    dispatch({type: 'setCaptcha', value: captchaCode})
    dispatch({type: 'setPassword', value: password})
    // dispatch({ type:  })

    dispatch({type: 'next'})
    logger.metric(
      'signup:nextPressed',
      {
        activeStep: state.activeStep,
      },
      {statsig: true},
    )
  }

  return (
    <ScreenTransition>
      <View style={[a.gap_md]}>
        <FormError error={state.error} />
        {/* <HostingProvider
          minimal
          serviceUrl={state.serviceUrl}
          onSelectServiceUrl={v => dispatch({type: 'setServiceUrl', value: v})}
        /> */}
        {state.isLoading || isLoadingStarterPack ? (
          <View style={[a.align_center]}>
            <Loader size="xl" />
          </View>
        ) : state.serviceDescription ? (
          <>
            {state.serviceDescription.inviteCodeRequired && (
              <View>
                <TextField.LabelText>
                  <Trans>Invite code</Trans>
                </TextField.LabelText>
                <TextField.Root isInvalid={state.errorField === 'invite-code'}>
                  <TextField.Icon icon={Ticket} />
                  <TextField.Input
                    onChangeText={value => {
                      inviteCodeValueRef.current = value.trim()
                      if (
                        state.errorField === 'invite-code' &&
                        value.trim().length > 0
                      ) {
                        dispatch({type: 'clearError'})
                      }
                    }}
                    label={_(msg`Required for this provider`)}
                    defaultValue={state.inviteCode}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    submitBehavior={native('submit')}
                    onSubmitEditing={native(() =>
                      emailInputRef.current?.focus(),
                    )}
                  />
                </TextField.Root>
              </View>
            )}
            <View>
              <TextField.LabelText>账户</TextField.LabelText>
              <TextField.Root isInvalid={state.errorField === 'email'}>
                <TextField.Icon icon={At} />
                <TextField.Input
                  testID="emailInput"
                  inputRef={emailInputRef}
                  onChangeText={value => {
                    emailValueRef.current = value.trim()
                    if (hasWarnedEmail) {
                      setHasWarnedEmail(false)
                    }
                    if (
                      state.errorField === 'email' &&
                      value.trim().length > 0 &&
                      validateAccount(value.trim())
                    ) {
                      dispatch({type: 'clearError'})
                    }
                  }}
                  label="手机号或电子邮箱地址"
                  defaultValue={state.email}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  submitBehavior={native('submit')}
                  onSubmitEditing={native(() =>
                    passwordInputRef.current?.focus(),
                  )}
                />
              </TextField.Root>
            </View>
            <View>
              <TextField.LabelText>验证码</TextField.LabelText>
              <TextField.Root isInvalid={state.errorField === 'captcha'}>
                <TextField.Icon icon={Shield} />
                <TextField.Input
                  testID="captchaInput"
                  inputRef={captchaInputRef}
                  onChangeText={value => {
                    captchaValueRef.current = value
                    if (state.errorField === 'captcha' && value.length >= 4) {
                      dispatch({type: 'clearError'})
                    }
                  }}
                  label="验证码"
                  defaultValue=""
                  keyboardType="number-pad"
                  // secureTextEntry
                  // autoComplete=""
                  autoCapitalize="none"
                  returnKeyType="next"
                  submitBehavior={native('blurAndSubmit')}
                  onSubmitEditing={native(() =>
                    passwordInputRef.current?.focus(),
                  )}
                  // passwordRules="minlength: 8;"
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
                    captchaAPI.send(emailValueRef.current, 3).catch(e => {
                      dispatch({
                        type: 'setError',
                        value: e.message,
                        field: 'email',
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
            <View>
              <TextField.LabelText>
                <Trans>Password</Trans>
              </TextField.LabelText>
              <TextField.Root isInvalid={state.errorField === 'password'}>
                <TextField.Icon icon={Lock} />
                <TextField.Input
                  testID="passwordInput"
                  inputRef={passwordInputRef}
                  onChangeText={value => {
                    passwordValueRef.current = value
                    if (state.errorField === 'password' && value.length >= 8) {
                      dispatch({type: 'clearError'})
                    }
                  }}
                  label={_(msg`Choose your password`)}
                  defaultValue={state.password}
                  secureTextEntry
                  autoComplete="new-password"
                  autoCapitalize="none"
                  returnKeyType="next"
                  submitBehavior={native('blurAndSubmit')}
                  onSubmitEditing={native(() =>
                    birthdateInputRef.current?.focus(),
                  )}
                  passwordRules="minlength: 8;"
                />
              </TextField.Root>
            </View>
            {/* <View>
              <DateField.LabelText>
                <Trans>Your birth date</Trans>
              </DateField.LabelText>
              <DateField.DateField
                testID="date"
                inputRef={birthdateInputRef}
                value={state.dateOfBirth}
                onChangeDate={date => {
                  dispatch({
                    type: 'setDateOfBirth',
                    value: sanitizeDate(new Date(date)),
                  })
                }}
                label={_(msg`Date of birth`)}
                accessibilityHint={_(msg`Select your date of birth`)}
                maximumDate={new Date()}
              />
            </View> */}
            <Policies
              serviceDescription={{
                // inviteCodeRequired: false,
                // phoneVerificationRequired: false,
                links: {
                  termsOfService: SERVICE_PROTOCOL_FILE_URL, // 'https://www.baidu.com',
                  privacyPolicy: PRIVACY_PROTOCOL_FILE_URL, // 'https://www.baidu.com',
                },
              }}
              needsGuardian={false} // {!is18(state.dateOfBirth)}
              under13={false} // {!is13(state.dateOfBirth)}
            />
          </>
        ) : undefined}
      </View>
      <BackNextButtons
        // hideNext={!is13(state.dateOfBirth)}
        showRetry={isServerError}
        isLoading={presubmitLoading || state.isLoading}
        onBackPress={onPressBack}
        onNextPress={onNextPress}
        onRetryPress={refetchServer}
        overrideNextText={hasWarnedEmail ? _(msg`It's correct`) : undefined}
      />
    </ScreenTransition>
  )
}
