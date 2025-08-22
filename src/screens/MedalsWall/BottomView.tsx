import { StyleSheet, View } from "react-native";
import { Text } from "#/components/Typography";

const BottomView = () => {
  return <View style={styles.wrap}>
    <Text style={styles.reach_bottom}>到底了~</Text>
  </View>
}

export default BottomView;

const styles = StyleSheet.create({
  wrap :{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBlock: 15
  },
  reach_bottom: {
    fontSize: 12,
    lineHeight: 16,
    color: '#959399'
  }
})