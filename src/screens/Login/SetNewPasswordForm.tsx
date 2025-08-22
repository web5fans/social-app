import {useState} from 'react'
import {ActivityIndicator, View} from 'react-native'
import {BskyAgent} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {logEvent} from '#/lib/statsig/statsig'
import {isNetworkError} from '#/lib/strings/errors'
import {cleanError} from '#/lib/strings/errors'
import {checkAndFormatResetCode, checkPassword} from '#/lib/strings/password'
import {isEmail, isPhoneNumber} from '#/lib/validator'
import {logger} from '#/logger'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {FormError} from '#/components/forms/FormError'
import * as TextField from '#/components/forms/TextField'
import {Lock_Stroke2_Corner0_Rounded as Lock} from '#/components/icons/Lock'
import {Ticket_Stroke2_Corner0_Rounded as Ticket} from '#/components/icons/Ticket'
import {Text} from '#/components/Typography'
import server from '#/server'
import {FormContainer} from './FormContainer'

export const SetNewPasswordForm = ({
  error,
  serviceUrl,
  setError,
  onPressBack,
  onPasswordSet,
  account,
}: {
  error: string
  serviceUrl: string
  setError: (v: string) => void
  onPressBack: () => void
  onPasswordSet: () => void
  account: string
}) => {
  const {_} = useLingui()
  const t = useTheme()

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [resetCode, setResetCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const onPressNext = async () => {
    // Check that the code is correct. We do this again just incase the user enters the code after their pw and we
    // don't get to call onBlur first
    const formattedCode = checkAndFormatResetCode(
      resetCode,
      isEmail(account) ? 'email' : 'phone',
    )

    if (!formattedCode) {
      setError(
        // _(
        //   msg`You have entered an invalid code. It should look like XXXXX-XXXXX.`,
        // ),
        '你输入的验证码无效。',
      )
      logEvent('signin:passwordResetFailure', {})
      return
    }

    const passValidation = await checkPassword(password)

    if (passValidation.type !== 'VALID') {
      setError(passValidation.message)
      return
    }

    // TODO Better password strength check
    // if (!password) {
    //   setError(_(msg`Please enter a password.`))
    //   return
    // }

    // if (password.length < 8) {
    //   setError("你输入的密码应至少包含8个字符。")
    //   return;
    // }

    setError('')
    setIsProcessing(true)

    try {
      const res = await server.dao(
        'POST /user/reset-password',
        {
          email: isEmail(account) ? account : '',
          phone: isPhoneNumber(account) ? account : '',
          verifyCode: formattedCode,
          password,
          resetPasswordType: isPhoneNumber(account) ? 2 : 1,
          phoneRegion: '86',
        },
        {getWholeBizData: true},
      )

      if (!res.data) {
        throw new Error(res.message || '请求失败，请稍后再试。(#419)')
      }
      // const agent = new BskyAgent({ service: serviceUrl })
      // await agent.com.atproto.server.resetPassword({
      //   token: formattedCode,
      //   password,
      // })
      onPasswordSet()
      logEvent('signin:passwordResetSuccess', {})
    } catch (e: any) {
      const errMsg = e.toString()
      logger.warn('Failed to set new password', {error: e})
      logEvent('signin:passwordResetFailure', {})
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

  const onBlur = () => {
    const formattedCode = checkAndFormatResetCode(
      resetCode,
      isEmail(account) ? 'email' : 'phone',
    )
    if (!formattedCode) {
      setError('你输入的验证码无效。')
      return
    }
    setResetCode(formattedCode)
  }

  return (
    <FormContainer
      testID="setNewPasswordForm"
      titleText={<Trans>Set new password</Trans>}>
      <Text style={[a.leading_snug, a.mb_sm]}>
        {/* <Trans>
          You will receive an email with a "reset code." Enter that code here,
          then enter your new password.
        </Trans> */}
        你将收到
        {isPhoneNumber(account)
          ? '一条带有验证码的短信'
          : '一封带有验证码的电子邮件'}
        。请在这里输入验证码，然后输入你的新密码来完成重置。
      </Text>

      <View>
        <TextField.LabelText>验证码</TextField.LabelText>
        <TextField.Root>
          <TextField.Icon icon={Ticket} />
          <TextField.Input
            testID="resetCodeInput"
            // label={_(msg`Looks like XXXXX-XXXXX`)}
            label="请输入验证码"
            autoCapitalize="none"
            autoFocus={true}
            autoCorrect={false}
            autoComplete="off"
            value={resetCode}
            onChangeText={setResetCode}
            onFocus={() => setError('')}
            onBlur={onBlur}
            editable={!isProcessing}
            accessibilityHint={_(
              msg`Input code sent to your email for password reset`,
            )}
          />
        </TextField.Root>
      </View>

      <View>
        <TextField.LabelText>设置新密码</TextField.LabelText>
        <TextField.Root>
          <TextField.Icon icon={Lock} />
          <TextField.Input
            testID="newPasswordInput"
            label={_(msg`Enter a password`)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="done"
            secureTextEntry={true}
            textContentType="password"
            clearButtonMode="while-editing"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={onPressNext}
            editable={!isProcessing}
            accessibilityHint={_(msg`Input new password`)}
          />
        </TextField.Root>
      </View>

      <FormError error={error} />

      <View style={[a.flex_row, a.align_center, a.pt_lg]}>
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
        {isProcessing ? (
          <ActivityIndicator />
        ) : (
          <Button
            label={_(msg`Next`)}
            variant="solid"
            color="primary"
            size="large"
            onPress={onPressNext}>
            <ButtonText>
              <Trans>Next</Trans>
            </ButtonText>
          </Button>
        )}
        {isProcessing ? (
          <Text style={[t.atoms.text_contrast_high, a.pl_md]}>
            <Trans>Updating...</Trans>
          </Text>
        ) : undefined}
      </View>
    </FormContainer>
  )
}
