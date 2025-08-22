import {type StyleProp, type ViewStyle} from 'react-native'
import Svg, {Path} from 'react-native-svg'

export type IconProps = {
  size: number
  style?: StyleProp<ViewStyle>
  color?: string
}

export default function TrashIcon(props: IconProps) {
  const {size, style, color = 'currentColor'} = props
  return (
    <Svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      fill="none"
      style={[style]}>
      <Path
        d="M6 9.26471H30M13.5 4.5H22.5M15 25.1471V15.6176M21 25.1471V15.6176M23.25 31.5H12.75C11.0931 31.5 9.75 30.0778 9.75 28.3235L9.0651 10.9191C9.02959 10.0167 9.71087 9.26471 10.5638 9.26471H25.4362C26.2891 9.26471 26.9704 10.0167 26.9349 10.9191L26.25 28.3235C26.25 30.0778 24.9069 31.5 23.25 31.5Z"
        stroke={color}
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  )
}
