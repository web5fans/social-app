import  {type ReactNode} from 'react'
import {Pressable, StyleSheet, Text} from 'react-native'
import {Image} from 'expo-image'

import ExpandRightIcon from '#/components/DAO/icons/expand-right'

type LabelProps = {
  placeholder: string
  onPress: () => void
  onClear: () => void
  label?: ReactNode
}

export function Label(props: LabelProps) {
  const {label, placeholder, onPress, onClear} = props

  const valued = !!label

  return (
    <Pressable
      accessibilityRole="menu"
      style={[S.wrap, valued && S.valued]}
      onPress={onPress}>
      {valued ? (
        <>
          {label}
          <Pressable
            accessibilityRole="button"
            onPress={event => {
              event.stopPropagation()
              onClear()
            }}>
            <Image
              accessibilityIgnoresInvertColors
              style={{width: 16, height: 16}}
              source={require('#/assets/close-rounded.svg')}
            />
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[S.placeholderText]}>{placeholder}</Text>
          <ExpandRightIcon
            style={{rotate: '90deg'}}
            color="#42576C"
            size={16}
          />
        </>
      )}
    </Pressable>
  )
}

const S = StyleSheet.create({
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F3F5',
    width: 'fit-content',
    height: 30,
    borderRadius: 15,
    cursor: 'pointer',
    gap: 2,
  },
  valued: {
    backgroundColor: 'rgba(16, 131, 254, 0.10)',
  },
  placeholderText: {
    color: '#42576C',
  },
})
