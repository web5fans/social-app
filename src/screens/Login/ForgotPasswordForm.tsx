import React, {useState} from 'react'
import {ActivityIndicator, Keyboard, View} from 'react-native'
import {type ComAtprotoServerDescribeServer} from '@atproto/api'
import {BskyAgent} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import * as EmailValidator from 'email-validator'

import {isNetworkError} from '#/lib/strings/errors'
import {cleanError} from '#/lib/strings/errors'
import {isPhoneNumber, validateAccount} from '#/lib/validator'
import {logger} from '#/logger'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {FormError} from '#/components/forms/FormError'
// import {HostingProvider} from '#/components/forms/HostingProvider'
import * as TextField from '#/components/forms/TextField'
import {At_Stroke2_Corner0_Rounded as At} from '#/components/icons/At'
import {Text} from '#/components/Typography'
import server from '#/server'
import {FormContainer} from './FormContainer'

type ServiceDescription = ComAtprotoServerDescribeServer.OutputSchema

export const ForgotPasswordForm = ({
  error,
  serviceUrl,
  serviceDescription,
  setError,
  // setServiceUrl,
  onPressBack,
  onEmailSent,
}: {
  error: string
  serviceUrl: string
  serviceDescription: ServiceDescription | undefined
  setError: (v: string) => void
  setServiceUrl: (v: string) => void
  onPressBack: () => void
  onEmailSent: (emailOrPhone: string) => void
}) => {
  const t = useTheme()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const {_} = useLingui()

  // const onPressSelectService = React.useCallback(() => {
  //   Keyboard.dismiss()
  // }, [])

  const onPressNext = async () => {
    if (!validateAccount(email)) {
      return setError('你的电子邮箱或手机号码似乎无效。')
    }

    setError('')
    setIsProcessing(true)

    try {
      const res = await (isPhoneNumber(email)
        ? server.dao(
            'POST /sms/send',
            {codeType: 2, phoneRegion: '86', phone: email},
            {getWholeBizData: true},
          )
        : server.dao(
            'POST /email/send',
            {codeType: 2, email, name: ''},
            {getWholeBizData: true},
          ))
      if (!res.data) {
        throw new Error(res.message || '请求失败，请稍后再试。(#418)')
      }
      // const agent = new BskyAgent({ service: serviceUrl })
      // await agent.com.atproto.server.requestPasswordReset({ email })
      onEmailSent(email)
    } catch (e: any) {
      const errMsg = e.toString()
      logger.warn('Failed to request password reset', {error: e})
      setIsProcessing(false)
      if (isNetworkError(e)) {
        setError(
          _(
            msg`Unable to contact your service. Please check your Internet connection.`,
          ),
        )
      } else {
        setError(cleanError(errMsg))
      }
    }
  }

  return (
    <FormContainer
      testID="forgotPasswordForm"
      titleText={<Trans>Reset password</Trans>}>
      {/* <View>
        <TextField.LabelText>
          <Trans>Hosting provider</Trans>
        </TextField.LabelText>
        <HostingProvider
          serviceUrl={serviceUrl}
          onSelectServiceUrl={setServiceUrl}
          onOpenDialog={onPressSelectService}
        />
      </View> */}
      <View>
        <TextField.LabelText>
          {/* <Trans>Email address</Trans> */}
          电子邮箱地址/手机号码
        </TextField.LabelText>
        <TextField.Root>
          <TextField.Icon icon={At} />
          <TextField.Input
            testID="forgotPasswordEmail"
            label="输入你的电子邮箱地址或手机号码"
            autoCapitalize="none"
            autoFocus
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!isProcessing}
            accessibilityHint={_(msg`Sets email for password reset`)}
          />
        </TextField.Root>
      </View>

      <Text style={[t.atoms.text_contrast_high, a.leading_snug]}>
        输入你创建账户时使用的电子邮箱或手机号码。我们将向你发送用于密码重置的验证码。
        {/* <Trans>
          Enter the email you used to create your account. We'll send you a
          "reset code" so you can set a new password.
        </Trans> */}
      </Text>

      <FormError error={error} />

      <View style={[a.flex_row, a.align_center, a.pt_md]}>
        <Button
          label={_(msg`Back`)}
          variant="solid"
          color="secondary"
          size="large"
          onPress={onPressBack}>
          <ButtonText>
            <Trans>Back</Trans>
          </ButtonText>
        </Button>
        <View style={a.flex_1} />
        {!serviceDescription || isProcessing ? (
          <ActivityIndicator />
        ) : (
          <Button
            label={_(msg`Next`)}
            variant="solid"
            color={'primary'}
            size="large"
            onPress={onPressNext}>
            <ButtonText>
              <Trans>Next</Trans>
            </ButtonText>
          </Button>
        )}
        {!serviceDescription || isProcessing ? (
          <Text style={[t.atoms.text_contrast_high, a.pl_md]}>
            <Trans>Processing...</Trans>
          </Text>
        ) : undefined}
      </View>
      {/* <View
        style={[
          t.atoms.border_contrast_medium,
          a.border_t,
          a.pt_2xl,
          a.mt_md,
          a.flex_row,
          a.justify_center,
        ]}>
        <Button
          testID="skipSendEmailButton"
          onPress={onEmailSent}
          label={_(msg`Go to next`)}
          accessibilityHint={_(msg`Navigates to the next screen`)}
          size="large"
          variant="ghost"
          color="secondary">
          <ButtonText>
            <Trans>Already have a code?</Trans>
          </ButtonText>
        </Button>
      </View> */}
    </FormContainer>
  )
}
