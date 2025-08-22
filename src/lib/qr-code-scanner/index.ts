import {isWeb} from '#/platform/detection'
import scanQR_Native from './native'
import scanQR_Web from './web'

export async function scanQR() {
  return isWeb ? scanQR_Web() : scanQR_Native()
}
