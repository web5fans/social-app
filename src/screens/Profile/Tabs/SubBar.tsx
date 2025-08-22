import React, { PropsWithChildren, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {atoms as a, useTheme} from '#/alf'
import { Text } from "#/components/Typography";
import * as Layout from '#/components/Layout'

type SubBarProps = {
  items: {key: string, label: string}[],
}

const SubBar = (props: PropsWithChildren<SubBarProps>) => {
  const { items } = props;
  const [activeTab, setActiveTab] = useState(items[0].key);

  return <Layout.Center>
    <View style={styles.wrap}>
      {items.map(tab => {
        return <Pressable
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          accessibilityLabel={tab.label}
          accessibilityHint=""
        >
          <View
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText ,
                activeTab === tab.key && styles.activeTabText,
              ]}>{tab.label}</Text>
          </View>
        </Pressable>
      })}
    </View>
    {React.Children.map(props.children, (child, i) => (
      React.cloneElement(child, {
        // @ts-ignore
        feed: activeTab,
      })
    ))}
  </Layout.Center>
}

export default SubBar;

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: 18,
    paddingRight: 15,
    paddingTop: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  tabItem: {
    paddingInline: 12,
    paddingBlock: 6,
    borderWidth: 1,
    borderColor: '#D4DBE2',
    borderRadius: 15,
    color: '#42576C'
  },
  tabText: {color: '#42576C', lineHeight: 18},
  activeTabText: {color: '#fff', fontWeight: 500},
  activeTab: {backgroundColor: '#0B0F14', borderColor: '#0B0F14'},
})