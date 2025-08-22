import {type StyleProp, StyleSheet, View, type ViewStyle} from 'react-native'

import {atoms as a} from '#/alf'
import {ProposalStatus} from '#/server/dao/enums'
import {Text} from './Typography'

// export enum ProposalStatus {
//   InProgress = 1,
//   Pass,
//   Fail,
// }

const statusCfgMap = {
  [ProposalStatus.InProgress]: {text: '进行中', styleName: 'inprogress'},
  [ProposalStatus.Pass]: {text: '已通过', styleName: 'pass'},
  [ProposalStatus.Fail]: {text: '未通过', styleName: 'fail'},
} as const

export type ProposalStatusTagProps = {
  status: ProposalStatus | undefined
  style?: StyleProp<ViewStyle>
}

export default function ProposalStatusTag(props: ProposalStatusTagProps) {
  const {status, style} = props
  if (!status) return null
  const cfg = statusCfgMap[status]
  return (
    <View
      style={StyleSheet.flatten([styles.tag, styles[cfg.styleName], style])}>
      <Text style={[a.text_xs, styles[`${cfg.styleName}Text`]]}>
        {cfg.text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'baseline',
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    paddingBlock: 4,
    paddingInline: 4,
  },
  text: {
    // text-align: center;
    // fontSize: 12,
    // font-style: normal;
    // font-weight: 400;
    // line-height: 32px; /* 133.333% */
  },
  inprogress: {
    borderColor: '#1083FE',
  },
  inprogressText: {
    color: '#1083FE',
  },

  pass: {
    borderColor: '#34BE79',
  },
  passText: {
    color: '#34BE79',
  },

  fail: {
    borderColor: '#FD615B',
  },
  failText: {
    color: '#FD615B',
  },
})
