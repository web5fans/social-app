import {useBreakpoints} from '#/alf'
import server from '#/server'
import {useRequest} from 'ahooks'
import {RepoFieldMobile} from './mobile'
import {RepoFieldPC} from './pc'

export function RepoField() {
  const {gtMobile} = useBreakpoints()

  const {data: nodeList} = useRequest(async () => server.dao('POST /node/list'))

  return gtMobile ? (
    <RepoFieldPC nodeList={nodeList} />
  ) : (
    <RepoFieldMobile nodeList={nodeList} />
  )
}
