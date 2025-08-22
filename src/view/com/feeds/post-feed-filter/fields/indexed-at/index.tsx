import {useBreakpoints} from '#/alf'
import {IndexedAtFieldMobile} from './mobile'
import {IndexedAtFieldPC} from './pc'

export function IndexedAtField() {
  const {gtMobile} = useBreakpoints()

  return gtMobile ? <IndexedAtFieldPC /> : <IndexedAtFieldMobile />
}
