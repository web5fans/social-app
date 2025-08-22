import {isNil} from 'lodash'

type Opt = {
  defaultVal: string
  separator: string
  stepLen: number
}

const defaltOpt: NonNullable<Opt> = {
  defaultVal: '-',
  separator: ',',
  stepLen: 3,
}

export default function displayNumber(
  val?: number | string,
  opt?: Partial<Opt>,
) {
  const mergedOpt = {...defaltOpt, ...opt}
  if (isNil(val)) return mergedOpt.defaultVal
  if (+val < 10 ** mergedOpt.stepLen) return val + ''
  // /\B(?=(\d{3})+(?!\d))/g
  const reg = new RegExp(`\\B(?=(\\d{${mergedOpt.stepLen}})+(?!\\d))`, 'g')
  return (val + '').replace(reg, mergedOpt.separator)
}
