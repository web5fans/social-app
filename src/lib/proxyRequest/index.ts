import {get} from '#/state/persisted'
import {defineProxyAPI} from '#/server/dao/defineAPI'
import {type HTTPMethod} from '#/server/utils'

function getToken() {
  const session = get('session')
  return session.currentAccount?.accessJwt
}

export default function proxyRequest(
  url: string,
  method: HTTPMethod,
  params: Record<string, any> = {},
  useAuth: boolean = true,
) {
  const token = getToken()
  return defineProxyAPI(url, method)(
    {
      ban_labels: ['blacklist'],
      ...params,
    },
    {
      headers: {
        Authorization: useAuth && token ? `Bearer ${token}` : '',
      },
      getWholeBizData: true,
    },
  )
}
