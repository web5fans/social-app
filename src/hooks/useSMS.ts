import {useState} from 'react'
import {useCountDown} from 'ahooks'

import {isEmail, isPhoneNumber} from '#/lib/validator'
import server from '#/server'

const parseReceiver = (
  receiver: string,
): APIDao.WebEndpointsUserRegisterType => {
  if (isPhoneNumber(receiver)) return 2
  if (isEmail(receiver)) return 1
  return 0
}

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function useSMS() {
  const [targetDate, setTargetDate] = useState<number | undefined>()
  const [countdown, formattedRes] = useCountDown({targetDate})
  const [executing, setExecuting] = useState(false)

  return {
    ticking: executing || !!countdown,
    countdownText: countdown ? `${formattedRes.seconds}s` : '', // 发送验证码 ｜ 60s
    send: async (receiver: string, codeType: APIDao.WebUtilsCodeType) => {
      const receiverType = parseReceiver(receiver)
      if (!receiverType) {
        throw new Error('手机号或邮箱不正确')
      }
      setExecuting(true)
      try {
        const flagRes = await (receiverType === 2
          ? server.dao(
              'POST /sms/send',
              {phoneRegion: '86', phone: receiver, codeType},
              {getWholeBizData: true},
            )
          : server.dao(
              'POST /email/send',
              {name: '', email: receiver, codeType},
              {getWholeBizData: true},
            ))
        const flag = flagRes?.data
        if (!flag) {
          throw new Error(flagRes.message)
        }
        setTargetDate(Date.now() + 60 * 1000)
      } finally {
        setExecuting(false)
      }
    },
  }
}
