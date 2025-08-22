import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {type NumberProp, Path, Rect} from 'react-native-svg'

export type SettingsPhoneSvgProps = {
  size: NumberProp
  style?: StyleProp<ViewStyle>
  // active?: boolean
  // activeColor?: string
  inactiveColor?: string
}

export default function SettingsPhoneSvg(props: SettingsPhoneSvgProps) {
  const {size, style, inactiveColor = 'black'} = props
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={[style]}
      // xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M18 12.0008H30M9.59998 9.60078V38.4008C9.59998 41.0518 11.749 43.2008 14.4 43.2008H33.6C36.2509 43.2008 38.4 41.0518 38.4 38.4008V9.60081C38.4 6.94984 36.2509 4.80081 33.6 4.80081L14.4 4.80078C11.749 4.80078 9.59998 6.94981 9.59998 9.60078ZM24 33.6008H24.17V33.7546H24V33.6008Z"
        stroke={inactiveColor}
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  )
}
