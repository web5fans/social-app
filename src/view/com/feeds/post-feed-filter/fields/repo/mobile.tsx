import {Button, ButtonText} from '#/components/Button'
import {extractAssetUrl} from '#/lib/extractAssetUrl'
import {PostFeedFilterContext} from '#/view/com/feeds/post-feed-filter/context'
import {Label} from '#/view/com/feeds/post-feed-filter/fields/Label'
import {useBoolean} from 'ahooks'
import {Popup} from 'antd-mobile'
import {Image} from 'expo-image'
import {useContext, useState} from 'react'
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type Node = APIDao.WebEndpointsNodeNodeListVo

type Props = {
  nodeList?: Node[] | null
}

export function RepoFieldMobile(props: Props) {
  const {nodeList} = props

  const {tabName, fields, setField} = useContext(PostFeedFilterContext)

  const storeValue = fields.repo

  const [visible, setVisible] = useBoolean(false)

  const [candidate, setCandidate] = useState<Node | undefined>(storeValue)

  return (
    <>
      <Label
        label={
          storeValue && (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 4,
                alignItems: 'center',
              }}>
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

          <Text style={S.modalSubTitle}>按节点筛选</Text>

          <ScrollView style={S.nodeList}>
            {nodeList?.map(node => {
              return (
                <Pressable
                  accessibilityRole="button"
                  key={node.nodeId}
                  style={[
                    S.nodeItem,
                    candidate?.nodeId === node.nodeId && S.selectedItem,
                  ]}
                  onPress={() => {
                    setCandidate({
                      ...node,
                      userDid: node.userDid || `user_unset::${node.nodeId}`,
                    })
                  }}>
                  <Image
                    accessibilityIgnoresInvertColors
                    style={{width: 28, height: 28, borderRadius: 14}}
                    source={{
                      uri: extractAssetUrl(node.logo),
                    }}
                  />
                  <Text style={S.nodeName}>{node.name}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <View style={S.operations}>
            <Button
              style={[S.button, S.buttonReset]}
              label="cancel"
              variant="outline"
              onPress={() => setCandidate(undefined)}>
              <ButtonText style={{color: '#0B0F14'}}>重置</ButtonText>
            </Button>
            <Button
              style={S.button}
              label="confirm"
              variant="solid"
              color="primary"
              onPress={() => {
                setField("repo", candidate)
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
  selector: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F3F5',
    // @ts-ignore
    width: 'fit-content',
    height: 30,
    borderRadius: 15,
    cursor: 'pointer',
    gap: 2,
  },
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
  nodeList: {
    maxHeight: Dimensions.get('screen').height / 3,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 6,
  },
  nodeItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#F1F3F5',
    gap: 6,
  },
  nodeName: {
    color: '#0B0F14',
    fontSize: 16,
    fontWeight: 400,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#1083FE',
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
