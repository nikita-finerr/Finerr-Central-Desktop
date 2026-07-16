import { X } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";

type Props = {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

const ChatImageViewer = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const safeIndex = Math.min(
      Math.max(initialIndex, 0),
      Math.max(images.length - 1, 0),
    );
    setCurrentIndex(safeIndex);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: safeIndex * Dimensions.width,
        animated: false,
      });
    });
  }, [images.length, initialIndex, visible]);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / Dimensions.width,
      );
      setCurrentIndex(index);
    },
    [],
  );

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item }) => (
      <View style={styles.page}>
        <Image
          source={{ uri: item }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Photo"
        />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${item}-${index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: Dimensions.width,
      offset: Dimensions.width * index,
      index,
    }),
    [],
  );

  if (!visible || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <View style={styles.root}>
        <FlatList
          ref={listRef}
          data={images}
          style={styles.list}
          horizontal
          pagingEnabled
          bounces={images.length > 1}
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialScrollIndex={Math.min(
            Math.max(initialIndex, 0),
            Math.max(images.length - 1, 0),
          )}
          onMomentumScrollEnd={onScrollEnd}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
        />

        <View
          style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
          >
            <X size={22} color={Colors.white} strokeWidth={2.5} />
          </Pressable>

          {images.length > 1 ? (
            <Text style={styles.counter}>
              {currentIndex + 1} / {images.length}
            </Text>
          ) : (
            <View style={styles.headerSpacer} />
          )}

          <View style={styles.headerSpacer} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  list: {
    flex: 1,
  },
  page: {
    width: Dimensions.width,
    height: Dimensions.height,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
  },
  image: {
    width: Dimensions.width,
    height: Dimensions.height,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.black + "35",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white + "12",
  },
  counter: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  headerSpacer: {
    width: 40,
  },
});

export default memo(ChatImageViewer);
