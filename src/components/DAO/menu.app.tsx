import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path, Rect} from 'react-native-svg'

export type MenuAppSvgProps = {
  size: number
  style?: StyleProp<ViewStyle>
  active?: boolean
  activeColor?: string
  inactiveColor?: string
}

export default function MenuAppSvg(props: MenuAppSvgProps) {
  const {
    size,
    style,
    active,
    activeColor = '#1083FE',
    inactiveColor = '#6F869F',
  } = props
  return (
    <Svg
      fill={active ? activeColor : 'none'}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={[style]}>
      <Rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="10"
        stroke={active ? activeColor : inactiveColor}
        stroke-width="4"
      />
      <Rect
        x="24"
        y="14"
        width="14"
        height="14"
        rx="4"
        transform="rotate(45 24 14)"
        stroke={active ? '#fff' : inactiveColor}
        stroke-width="4"
      />
    </Svg>
  )
}
