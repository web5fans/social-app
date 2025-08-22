import React from 'react'
import {StyleSheet, type TextInput, type TextInputProps} from 'react-native'
// @ts-expect-error untyped
import {unstable_createElement} from 'react-native-web'
import {format} from 'date-fns'

import {type DateFieldProps} from '#/components/forms/DateField/types'
// import {toSimpleDateString} from '#/components/forms/DateField/utils'
import * as TextField from '#/components/forms/TextField'
import {CalendarDays_Stroke2_Corner0_Rounded as CalendarDays} from '#/components/icons/CalendarDays'

export * as utils from '#/components/forms/DateField/utils'
export const LabelText = TextField.LabelText

const InputBase = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({style, ...props}, ref) => {
    return unstable_createElement('input', {
      ...props,
      ref,
      type: 'datetime-local',
      style: [
        StyleSheet.flatten(style),
        {
          background: 'transparent',
          border: 0,
        },
      ],
    })
  },
)

InputBase.displayName = 'InputBase'

const Input = TextField.createInput(InputBase as unknown as typeof TextInput)

export function DateTimeField({
  value,
  inputRef,
  onChangeDate,
  label,
  isInvalid,
  testID,
  accessibilityHint,
  maximumDate,
}: DateFieldProps) {
  const handleOnChange = React.useCallback(
    (e: any) => {
      const date = e.target.valueAsDate || e.target.value

      if (date) {
        const formatted = toSimpleDateTimeString(date)
        onChangeDate(formatted)
      }
    },
    [onChangeDate],
  )

  return (
    <TextField.Root isInvalid={isInvalid}>
      <TextField.Icon icon={CalendarDays} />
      <Input
        value={toSimpleDateTimeString(value)}
        inputRef={inputRef as React.Ref<TextInput>}
        label={label}
        onChange={handleOnChange}
        testID={testID}
        accessibilityHint={accessibilityHint}
        // @ts-expect-error not typed as <input type="date"> even though it is one
        max={maximumDate ? toSimpleDateTimeString(maximumDate) : undefined}
        step="1"
      />
    </TextField.Root>
  )
}

export function toSimpleDateTimeString(date: Date | string): string {
  const _date = typeof date === 'string' ? new Date(date) : date
  return format(_date, 'yyyy-MM-dd HH:mm:ss')
  // return _date.toISOString().split('T')[0]
}
