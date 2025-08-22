import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { Image } from "expo-image";
import {Portal} from '#/components/Portal'
import { useBoolean } from "ahooks";
import useScanWebQr from "#/lib/qr-code-scanner/useScanWebQr";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type QrScannerRefProps = {
  scan: () => Promise<string>
  close(): void
}

const QrScanner =  React.forwardRef<
  QrScannerRefProps,
  {}
>(function QrScanner(props, ref){
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, { setTrue, setFalse }] = useBoolean(false)
  const screenHeight = Dimensions.get("window").height

  const { scanQR, destroy } = useScanWebQr()

  const offset = useSharedValue(0);

  // 配置动画样式
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  useImperativeHandle(ref, () => ({
    scan: async () => {
      setTrue()
      const result = await scanQR(videoRef.current)
      setFalse()
      return result
    },
    close: setFalse,
  }))

  useEffect(() => {
    if (!show) {
      offset.value = 0
      destroy()
      return
    }
    offset.value = withRepeat(
      withTiming(screenHeight, {
        duration: 2500,       // 单程动画时长（毫秒）
        easing: Easing.inOut(Easing.ease), // 缓动函数
      }),
      -1,                    // 无限循环
      false                   // 反向播放（形成往返效果）
    );
  }, [show]);

  return <Portal>
    <View style={[styles.container, { zIndex: show ? 100 : -1 }]}>
      <View style={styles.back}>
        <Pressable
          accessibilityRole="button"
          accessibilityIgnoresInvertColors
          onPress={setFalse}
        >
          <Image
            accessibilityIgnoresInvertColors
            style={{ width: 14, height: 12 }}
            source={require('#/assets/arrow-left-white.svg')}
          />
        </Pressable>
      </View>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'black',
        }}
      />
      <Animated.View
        style={[styles.scanLine, animatedStyles]}
      />
    </View>
  </Portal>
})

export default QrScanner;

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    width: '100vw',
    height: '100%',
    zIndex: 100,
    top: 0,
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingLeft: 16,
    paddingTop: 18,
    zIndex: 10
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 60,
    backgroundImage: 'linear-gradient(180deg, rgba(0, 255, 51, 0) 23%, #00ff33 200%)',
    borderBottom: '1px solid #00ff33',
    zIndex: 2,
}
})