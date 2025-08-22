import {useState} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import {useRequest} from 'ahooks'

import {useSession} from '#/state/session'
import {Text} from '#/components/Typography'
import server from '#/server'

type Role = 'nodeUser'

type Tagype = {
  tag: string
  feedDes: string
  requiredRoles: Role[]
}

export const PostsHashTagType: Tagype[] = [
  {
    tag: '#任务',
    feedDes: 'tasks',
    requiredRoles: ['nodeUser'],
  },
  {
    tag: '#商品',
    feedDes: 'products',
    requiredRoles: ['nodeUser'],
  },
  {
    tag: '#活动',
    feedDes: 'activity',
    requiredRoles: [],
  },
]

export const PostsHashTagList = ['任务', '商品', '活动']

export const PostsHashTagTypeMap = PostsHashTagType.reduce((cur, item) => {
  cur[item.feedDes] = item.tag
  return cur
}, {})

const HashTag = (props: {
  active?: string
  setHashTag: (hashTag: string) => void
}) => {
  const {setHashTag, active = ''} = props

  const {currentAccount} = useSession()
  const {data: currentUserProfile} = useRequest(
    async () => server.dao('POST /user/login-user-detail'),
    {ready: !!currentAccount?.did},
  )

  const userRoles: Record<Role, boolean> = {
    nodeUser: currentUserProfile?.nodeUser === true,
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>请选择类型:</Text>
      <View style={styles.container}>
        {PostsHashTagType.map(({tag, requiredRoles}) => {
          const hasAuth = requiredRoles.every(role => userRoles[role])
          if (!hasAuth) return null

          const isActive = tag === active

          return (
            <Pressable
              key={tag}
              accessibilityRole={'button'}
              style={[styles.button, isActive && styles.button_active]}
              onPress={() => {
                setHashTag(isActive ? '' : tag)
              }}>
              <Text
                style={[
                  styles.button_text,
                  isActive && styles.button_active_text,
                ]}>
                {tag}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default HashTag

const styles = StyleSheet.create({
  wrap: {
    paddingBlock: 13,
    paddingInline: 16,
    backgroundColor: '#fff',
  },
  header: {
    color: '#6F869F',
    fontSize: 14,
    lineHeight: 18,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 7,
  },
  button: {
    paddingBlock: 7,
    paddingInline: 10,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
  },
  button_active: {
    backgroundColor: '#1083FE',
  },
  button_active_text: {
    color: '#fff',
  },
  button_text: {
    color: '#42576C',
    fontSize: 14,
    lineHeight: 18,
  },
})
