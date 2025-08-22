import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "#/components/Typography";

const InfiniteScroll = ({ threshold = 100, onLoadMore, isLoading, hasMore }: {
  threshold?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.8
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [threshold]);

  return (
    <View
      ref={sentinelRef}
      style={styles.sentinel}
    >
      {/*{isLoading && (*/}
      {/*  <View className="loading-indicator">*/}
      {/*    <View className="spinner"></View>*/}
      {/*    <span>正在加载更多...</span>*/}
      {/*  </View>*/}
      {/*)}*/}

      {!hasMore && !isLoading && (
        <Text style={styles.reach_bottom}>到底了~</Text>
      )}
    </View>
  );
};

export default InfiniteScroll;

const styles = StyleSheet.create({
  sentinel :{
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