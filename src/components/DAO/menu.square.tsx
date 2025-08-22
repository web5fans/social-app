import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path, Rect} from 'react-native-svg'

export type MenuSquareSvgProps = {
  size: number
  style?: StyleProp<ViewStyle>
  active?: boolean
  activeColor?: string
  inactiveColor?: string
}

export default function MenuSquareSvg(props: MenuSquareSvgProps) {
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
        d="M20.2061 3.36426C22.3452 1.60189 25.3883 1.54701 27.584 3.19922L27.7939 3.36426L43.7939 16.5479C45.1877 17.6962 46 19.4184 46 21.2402V35.915C46 41.498 41.5096 46 36 46H12C6.49039 46 2 41.498 2 35.915V21.2402C2 19.5322 2.71352 17.9116 3.95117 16.7695L4.20605 16.5479L20.2061 3.36426Z"
        stroke={active ? activeColor : inactiveColor}
        stroke-width="4"
      />
      <Rect
        x="22.5"
        y="23.5"
        width="3"
        height="15"
        rx="1.5"
        fill={active ? '#fff' : inactiveColor}
        stroke={active ? '#fff' : inactiveColor}
      />
    </Svg>
  )
}
