import {useEffect} from 'react'

import  {
  type AllNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {useSession} from '#/state/session'

type Props = NativeStackScreenProps<AllNavigatorParams, 'MiddlePage'>

const MiddlePage = (props: Props) => {
  const {navigation, route} = props
  const {hasSession, currentAccount} = useSession()

  useEffect(() => {
    if (!hasSession) {
      navigation.replace('Home')
    } else {
      navigation.replace('Profile', {
        name: currentAccount?.handle,
        ...route.params,
      })
    }
  }, [navigation, route, currentAccount, hasSession])

  return <></>
}

export default MiddlePage
