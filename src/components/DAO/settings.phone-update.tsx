import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {type NumberProp, Path, Rect} from 'react-native-svg'

export type SettingsUpdatePhoneSvgProps = {
  size: NumberProp
  style?: StyleProp<ViewStyle>
  // active?: boolean
  // activeColor?: string
  // inactiveColor?: string
}

export default function SettingsUpdatePhoneSvg(
  props: SettingsUpdatePhoneSvgProps,
) {
  const {size, style} = props
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
        d="M18 12.0008H30M9.59998 9.60078V38.4008C9.59998 41.0518 11.749 43.2008 14.4 43.2008H33.6C36.2509 43.2008 38.4 41.0518 38.4 38.4008V9.60081C38.4 6.94984 36.2509 4.80081 33.6 4.80081L14.4 4.80078C11.749 4.80078 9.59998 6.94981 9.59998 9.60078Z"
        stroke="black"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M31.4221 24.0139C30.0322 21.6144 27.4343 20 24.4588 20C21.0851 20 18.1969 22.0754 17.0043 25.0174M28.9806 25.0174H33V21.0035M17.5779 32.0417C18.9678 34.4412 21.5657 36.0556 24.5412 36.0556C27.9149 36.0556 30.8031 33.9802 31.9957 31.0382M20.0194 31.0382H16V35.0521"
        stroke="black"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  )
}
