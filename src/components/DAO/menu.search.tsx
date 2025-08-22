import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path, Rect} from 'react-native-svg'

export type MenuSearchSvgProps = {
  size: number
  style?: StyleProp<ViewStyle>
  active?: boolean
  activeColor?: string
  inactiveColor?: string
}

export default function MenuSearchSvg(props: MenuSearchSvgProps) {
  const {
    size,
    style,
    active,
    activeColor = '#1083FE',
    inactiveColor = '#6F869F',
  } = props
  return (
    <Svg
      fill={'none'}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      style={[style]}>
      <Rect
        x="1.66667"
        y="1.66667"
        width="30.6667"
        height="30.6667"
        rx="15.3333"
        stroke="#0B0F14"
        stroke-width="3.33333"
      />
      <Rect
        x="28.1904"
        y="25.8334"
        width="15.7959"
        height="3.33333"
        rx="1.66667"
        transform="rotate(45 28.1904 25.8334)"
        fill="#0B0F14"
      />
      {active && (
        <Path
          d="M7 17C7 11.4772 11.4772 7 17 7C22.5228 7 27 11.4772 27 17C27 22.5228 22.5228 27 17 27C11.4772 27 7 22.5228 7 17Z"
          fill="#0B0F14"
        />
      )}
    </Svg>
  )
}
