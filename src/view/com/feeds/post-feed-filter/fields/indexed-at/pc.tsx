import {useContext} from 'react'
import {Text, View} from 'react-native'
import {useBoolean} from 'ahooks'
import {DatePicker, Dropdown} from 'antd'
import dayjs from 'dayjs'

import {Label} from '#/view/com/feeds/post-feed-filter/fields/Label'
import {PostFeedFilterContext} from '../../context'
import {options} from './constant'

const {RangePicker} = DatePicker

export function IndexedAtFieldPC() {
  const {fields, setField} = useContext(PostFeedFilterContext)
  const storeValue = fields.indexed_at

  const [visible, setVisible] = useBoolean(false)
  const [pickerVisible, setPickerVisible] = useBoolean(false)

  return (
    <Dropdown
      menu={{
        activeKey: String(storeValue?.activeKey),
        items: [
          ...options,
          {
            key: 'custom',
            label: (
              <>
                <View style={{position: 'relative'}}>
                  <View style={{width: 80}}>
                    <Text>自定义</Text>
                  </View>
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: -1,
                      opacity: 0,
                    }}>
                    <RangePicker
                      style={{height: 0}}
                      open={pickerVisible}
                      onOpenChange={setPickerVisible.set}
                      onChange={v => {
                        if (!v) return
                        setPickerVisible.setFalse()
                        setField('indexed_at', {
                          activeKey: 'custom',
                          value: [dayjs(v[0]), dayjs(v[1])],
                        })
                        setTimeout(setVisible.setFalse)
                      }}
                    />
                  </View>
                </View>
              </>
            ),
          },
        ],
        onClick: info => {
          const {key} = info
          if (key === 'custom') {
            !pickerVisible && setPickerVisible.setTrue()
            return
          }

          const end = dayjs()
          const start = dayjs().subtract(+key, 'month')
          setField('indexed_at', {
            activeKey: key,
            value: [start, end],
          })
          setVisible.setFalse()
        },
      }}
      trigger={['click']}
      open={visible}
      onOpenChange={(open, info) => {
        if (pickerVisible) return
        if (info.source === 'menu') return
        setVisible.set(open)
      }}>
      <View>
        <Label
          label={
            options.find(option => option.key === storeValue?.activeKey)
              ?.label ||
            storeValue?.value?.map(d => d.format('YYYY/MM/DD')).join('--')
          }
          placeholder="按时间筛选"
          onPress={setVisible.setTrue}
          onClear={() => {
            setField('indexed_at', undefined)
          }}
        />
      </View>
    </Dropdown>
  )
}
