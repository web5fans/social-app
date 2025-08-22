import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path, Rect} from 'react-native-svg'

export type MenuHallSvgProps = {
  size: number
  style?: StyleProp<ViewStyle>
  active?: boolean
  activeColor?: string
  inactiveColor?: string
}

export default function MenuHallSvg(props: MenuHallSvgProps) {
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
      <Path
        d="M16 2H32C37.4987 2 42 6.52251 42 12.1553V43.9424C42 45.4745 40.4733 46.3933 39.2021 45.8242L39.0801 45.7646L30.5166 41.2109C26.5646 39.1094 21.8668 39.0436 17.8682 41.0137L17.4834 41.2109L8.91992 45.7646C7.62672 46.452 6 45.5239 6 43.9424V12.1553C6 6.52251 10.5013 2 16 2Z"
        stroke={active ? activeColor : inactiveColor}
        stroke-width="4"
      />
      <Rect
        x="32"
        y="15"
        width="4"
        height="16"
        rx="2"
        transform="rotate(90 32 15)"
        fill={active ? '#fff' : inactiveColor}
      />
      <Rect
        x="32"
        y="25"
        width="4"
        height="16"
        rx="2"
        transform="rotate(90 32 25)"
        fill={active ? '#fff' : inactiveColor}
      />
    </Svg>
  )
}
