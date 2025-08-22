import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path, Rect} from 'react-native-svg'

export type MenuUserCenterSvgProps = {
  size: number
  style?: StyleProp<ViewStyle>
  active?: boolean
  activeColor?: string
  inactiveColor?: string
}

export default function MenuUserCenterSvg(props: MenuUserCenterSvgProps) {
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
        x="6"
        y="2"
        width="36"
        height="36"
        rx="18"
        stroke={active ? activeColor : inactiveColor}
        stroke-width="4"
      />
      <Rect
        x="8"
        y="44"
        width="32"
        height="4"
        rx="2"
        fill={active ? activeColor : inactiveColor}
      />
      <Path
        d="M15.3378 25C17.0669 27.989 20.2986 30 24 30C27.7014 30 30.9331 27.989 32.6622 25"
        stroke={active ? '#fff' : inactiveColor}
        stroke-width="4"
        stroke-linecap="round"
      />
    </Svg>
  )
}
