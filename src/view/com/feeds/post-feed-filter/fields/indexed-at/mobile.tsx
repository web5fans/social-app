import {useContext, useState} from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'
import {Image} from 'expo-image'
import {useBoolean} from 'ahooks'
import {Popup} from 'antd-mobile'
import dayjs from 'dayjs'

import {Button, ButtonText} from '#/components/Button'
import {PostFeedFilterContext} from '../../context'
import {Label} from '../Label'
import {options} from './constant'
import {DateRangePicker} from './DateRangePicker'

export function IndexedAtFieldMobile() {
  const {tabName, fields, setField} = useContext(PostFeedFilterContext)
  const storeValue = fields.indexed_at

  const [visible, setVisible] = useBoolean(false)

  const [activeKey, setActiveKey] = useState<string | undefined>(
    storeValue?.activeKey,
  )
  const [value, setValue] = useState<[dayjs.Dayjs, dayjs.Dayjs] | undefined>(
    storeValue?.value,
  )

  return (
    <>
      <Label
        label={
          options.find(option => option.key === storeValue?.activeKey)?.label ||
          storeValue?.value?.map(d => d.format('YYYY/MM/DD')).join('--')
        }
        placeholder="按时间筛选"
        onPress={setVisible.setTrue}
        onClear={() => {
          setActiveKey(undefined)
          setValue(undefined)
          setField('indexed_at', undefined)
        }}
      />

      <Popup
        visible={visible}
        onClose={setVisible.setFalse}
        bodyStyle={{background: 'transparent'}}>
        <View style={S.modalWrap}>
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>{tabName}筛选</Text>
            <Pressable accessibilityRole="button" onPress={setVisible.setFalse}>
              <Image
                accessibilityIgnoresInvertColors
                style={{width: 16, height: 16}}
                source={require('#/assets/close.svg')}
              />
            </Pressable>
          </View>

          <Text style={S.modalSubTitle}>按时间筛选</Text>

          <View style={S.optionsContainer}>
            {options.map(option => {
              const {label, value, key} = option
              return (
                <Pressable
                  accessibilityRole="button"
                  key={key}
                  style={[S.option, activeKey === key && S.selected]}
                  onPress={() => {
                    setActiveKey(key)
                    const end = dayjs()
                    const start = dayjs().subtract(value, 'month')
                    setValue([start, end])
                  }}>
                  <Text>{label}</Text>
                </Pressable>
              )
            })}
          </View>

          <DateRangePicker
            active={activeKey === 'custom'}
            value={activeKey === 'custom' ? value : undefined}
            onChange={value => {
              setActiveKey('custom')
              setValue(value)
            }}
          />

          <View style={S.operations}>
            <Button
              style={[S.button, S.buttonReset]}
              label="cancel"
              variant="outline"
              onPress={() => {
                setActiveKey(undefined)
                setValue(undefined)
              }}>
              <ButtonText style={{color: '#0B0F14'}}>重置</ButtonText>
            </Button>
            <Button
              style={S.button}
              label="confirm"
              variant="solid"
              color="primary"
              disabled={!(!value || (!!value[0] && !!value[1]))}
              onPress={() => {
                setField(
                  'indexed_at',
                  value
                    ? {
                        activeKey: activeKey!,
                        value: value!,
                      }
                    : undefined,
                )
                setVisible.setFalse()
              }}>
              <ButtonText>确定</ButtonText>
            </Button>
          </View>
        </View>
      </Popup>
    </>
  )
}

const S = StyleSheet.create({
  selected: {
    backgroundColor: 'rgba(16, 131, 254, 0.10)',
  },
  modalWrap: {
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B0F14',
  },
  modalSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: '#0B0F14',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    rowGap: 10,
    columnGap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  option: {
    flex: 1,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F1F3F5',
  },
  operations: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 36,
    gap: 10,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
  },
  buttonReset: {
    borderWidth: 1,
    borderColor: '#D4DBE2',
  },
})
