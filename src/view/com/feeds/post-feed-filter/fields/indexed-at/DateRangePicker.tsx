import {useRef, useState} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useBoolean, useControllableValue} from 'ahooks'
import {DatePicker} from 'antd-mobile'
import dayjs from 'dayjs'

import {Button, ButtonText} from '#/components/Button'

type Props = {
  value?: [dayjs.Dayjs, dayjs.Dayjs]
  onChange?: (value: [dayjs.Dayjs, dayjs.Dayjs]) => void
  active?: boolean
}

export function DateRangePicker(props: Props) {
  const {active} = props
  const [value, setValue] = useControllableValue(props)

  const [startTimeVisible, setStartTimeVisible] = useBoolean(false)
  const [endTimeVisible, setEndTimeVisible] = useBoolean(false)

  const startTime = value?.[0]
  const endTime = value?.[1]

  return (
    <View style={S.container}>
      <Button
        style={[S.button, active && S.active]}
        label="start"
        variant="solid"
        color="secondary"
        onPress={setStartTimeVisible.setTrue}>
        <ButtonText>
          {startTime ? startTime.format('YYYY/MM/DD') : '开始时间'}
        </ButtonText>
      </Button>

      <DatePicker
        visible={startTimeVisible}
        onClose={setStartTimeVisible.setFalse}
        max={new Date()}
        value={startTime ? new Date(startTime.valueOf()) : undefined}
        onConfirm={value => {
          const date = dayjs(value)

          if (endTime && endTime.isBefore(date)) {
            setValue([endTime, date])
          } else {
            setValue([date, endTime])
          }
        }}
      />

      <Text>--</Text>

      <Button
        style={[S.button, active && S.active]}
        label="end"
        variant="solid"
        color="secondary"
        onPress={setEndTimeVisible.setTrue}>
        <ButtonText>
          {endTime ? endTime.format('YYYY/MM/DD') : '结束时间'}
        </ButtonText>
      </Button>

      <DatePicker
        visible={endTimeVisible}
        onClose={setEndTimeVisible.setFalse}
        max={new Date()}
        value={endTime ? new Date(endTime.valueOf()) : undefined}
        onConfirm={value => {
          const date = dayjs(value)

          if (startTime && startTime.isAfter(date)) {
            setValue([date, startTime])
          } else {
            setValue([startTime, date])
          }
        }}
      />
    </View>
  )
}

const S = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 38,
    borderRadius: 19,
  },
  active: {
    backgroundColor: 'rgba(16, 131, 254, 0.10)',
  },
})
