import {useReducer, useRef, useState} from 'react'
import {KeyboardAvoidingView, View} from 'react-native'
import {useRequest} from 'ahooks'
import {isNaN, isNumber} from 'lodash'

import {colors} from '#/lib/styles'
import * as Toast from '#/view/com/util/Toast'
import {atoms as a, web} from '#/alf'
import * as Dialog from '#/components/Dialog'
import * as TextField from '#/components/forms/TextField'
import server from '#/server'
import {Admonition} from '../Admonition'
import {Button, ButtonIcon, ButtonText} from '../Button'
import {Loader} from '../Loader'
import {Text} from '../Typography'

type RewardScoresDialogProps = {
  toUserDid: string
  extendInfo?: string
  control: Dialog.DialogControlProps
}

export default function RewardScoresDialog(props: RewardScoresDialogProps) {
  const {toUserDid, control, extendInfo} = props

  const [state, dispatch] = useReducer(reducer, {
    mutationStatus: 'default',
    error: '',
    score: '',
  })

  const {data: userInfo, refresh: refreshUser} = useRequest(
    async () => {
      const res = await server.dao('POST /user/login-user-detail')
      return res
    },
    {refreshDeps: [control.isOpen]},
  )

  const onSendScore = async () => {
    try {
      const score = +state.score
      const isValidNumber = !isNaN(score)

      if (!isValidNumber) {
        throw new Error('请输入有效的数字')
      }

      if (score > (userInfo?.score ?? 0)) {
        throw new Error('输入的稻米不能超过当前稻米')
      }

      dispatch({
        type: 'setMutationStatus',
        status: 'pending',
      })
      const submitRes = await server.dao(
        'POST /score/reward',
        {
          toUserDid,
          extendInfo: extendInfo || '',
          score: +state.score,
        },
        {getWholeBizData: true},
      )
      if (!submitRes.data) {
        throw new Error(submitRes.message)
      }
      Toast.show('打赏成功', 'check', 'center')
      dispatch({
        type: 'setMutationStatus',
        status: 'success',
      })
      dispatch({
        type: 'setScore',
        value: '',
      })
      refreshUser()
      control.close()
    } catch (e: any) {
      // logger.error('EmailDialog: update email failed', { safeMessage: e })
      // const { clean } = cleanError(e)
      dispatch({
        type: 'setError',
        error: e.message || '更新失败 (#544)',
      })
    }
  }

  return (
    <Dialog.Outer control={control}>
      <Dialog.Handle />
      <Dialog.ScrollableInner
        label="打赏稻米"
        style={web({maxWidth: 400, marginTop: '25vh'})}>
        <Dialog.Close />

        <View style={[a.gap_lg]}>
          <Text style={[a.text_xl, a.font_heavy]}>打赏</Text>
          <View style={[a.gap_md]}>
            <TextField.Root>
              {/* <TextField.Icon icon={Shield} /> */}
              <TextField.Input
                label="captcha code"
                placeholder="请输入打赏稻米"
                defaultValue=""
                onChangeText={
                  false
                    ? undefined
                    : value => dispatch({type: 'setScore', value})
                }
                keyboardType="number-pad"
                // autoComplete="email"
                autoCapitalize="none"
              />
            </TextField.Root>
            <Text>当前稻米: {userInfo?.score}</Text>
            {state.error && <Admonition type="error">{state.error}</Admonition>}
          </View>
          <Button
            label="打赏稻米"
            size="large"
            variant="solid"
            color="primary"
            onPress={onSendScore}
            style={[a.mt_xl]}
            disabled={!state.score || state.mutationStatus === 'pending'}>
            <ButtonText>确认</ButtonText>
            {state.mutationStatus === 'pending' && <ButtonIcon icon={Loader} />}
          </Button>
        </View>
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
}

type State = {
  mutationStatus: 'pending' | 'success' | 'error' | 'default'
  error: string
  score: string
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
      type: 'setScore'
      value: string
    }

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
    case 'setScore': {
      return {
        ...state,
        score: action.value,
      }
    }
  }
}
