import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {PostFeedFilterContext} from '#/view/com/feeds/post-feed-filter/context'
import {Label} from '#/view/com/feeds/post-feed-filter/fields/Label'
import {useBoolean} from 'ahooks'
import {Dropdown} from 'antd'
import {Image} from 'expo-image'
import {useContext} from 'react'
import {Text, View} from 'react-native'

type Props = {
  nodeList?: APIDao.WebEndpointsNodeNodeListVo[] | null
}

export function RepoFieldPC(props: Props) {
  const {nodeList} = props

  const {fields, setField} = useContext(PostFeedFilterContext)

  const storeValue = fields.repo

  const [visible, setVisible] = useBoolean(false)

  return (
    <Dropdown
      menu={{
        activeKey: storeValue?.nodeId,
        items: nodeList?.map(node => {
          return {
            key: node.nodeId,
            label: (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 4,
                  minWidth: 200,
                  height: 24,
                }}>
                <Image
                  accessibilityIgnoresInvertColors
                  style={{width: 16, height: 16, borderRadius: 8}}
                  source={{
                    uri: extractAssetUrl(node.logo),
                  }}
                />
                <Text>{node.name}</Text>
              </View>
            ),
          }
        }),
        onClick: info => {
          const {key} = info
          const node = nodeList!.find(node => node.nodeId === key)!
          setField('repo', {
            ...node,
            userDid: node.userDid || `user_unset::${node.nodeId}`,
          })
        },
      }}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible.set}>
      <View>
        <Label
          label={
            storeValue && (
              <View style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: 'center' }}>
                <Image
                  accessibilityIgnoresInvertColors
                  style={{width: 16, height: 16, borderRadius: 8}}
                  source={{
                    uri: extractAssetUrl(storeValue.logo),
                  }}
                />
                <Text numberOfLines={1} style={{maxWidth: 120}}>
                  {storeValue.name}
                </Text>
              </View>
            )
          }
          placeholder="按节点筛选"
          onPress={setVisible.setTrue}
          onClear={() => {
            setField('repo', undefined)
          }}
        />
      </View>
    </Dropdown>
  )
}
