import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
} from "../../../../../constants";
import type { ChatMessageDto } from "../../../../../types/message";
import { parseMmsMediaUrls } from "../utils/mmsMediaUrl";
import ChatImageViewer from "./ChatImageViewer";

const IMAGE_BUBBLE_WIDTH = Dimensions.width * 0.44;
const IMAGE_GAP = 2;
const IMAGE_GRID_HEIGHT = Dimensions.width * 0.44;
const IMAGE_MIN_HEIGHT = Dimensions.width * 0.22;
const IMAGE_MAX_HEIGHT = Dimensions.width * 0.44;
const IMAGE_MIN_WIDTH = Dimensions.width * 0.22;
const IMAGE_MAX_WIDTH = Dimensions.width * 0.44;

type ImageItem = {
  uri: string;
};

type Props = {
  item: ChatMessageDto;
  isSearchMatch?: boolean;
  isActiveSearchMatch?: boolean;
};

const getSingleImageSize = () => {
  let width = IMAGE_BUBBLE_WIDTH;
  let height = IMAGE_MAX_HEIGHT;

  if (height > IMAGE_MAX_HEIGHT) {
    height = IMAGE_MAX_HEIGHT;
    width = IMAGE_MAX_WIDTH;
  } else if (height < IMAGE_MIN_HEIGHT) {
    height = IMAGE_MIN_HEIGHT;
    width = IMAGE_MIN_WIDTH;
  }

  return { width, height };
};

type ImageTileProps = {
  image: ImageItem;
  style?: StyleProp<ImageStyle>;
  overlay?: string;
  onPress: () => void;
};

const ImageTile = ({ image, style, overlay, onPress }: ImageTileProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.imageTile, style]}
    accessibilityRole="imagebutton"
    accessibilityLabel={
      overlay ? `Photo, and ${overlay.slice(1)} more photos` : "Photo"
    }
  >
    <Image
      source={{ uri: image.uri }}
      style={styles.gridImage}
      resizeMode="cover"
    />
    {overlay ? (
      <View style={styles.moreOverlay}>
        <Text style={styles.moreOverlayText}>{overlay}</Text>
      </View>
    ) : null}
  </Pressable>
);

type ImageGridProps = {
  images: ImageItem[];
  onImagePress: (index: number) => void;
};

const ImageGrid = ({ images, onImagePress }: ImageGridProps) => {
  const count = images.length;
  const columnWidth = (IMAGE_BUBBLE_WIDTH - IMAGE_GAP) / 2;

  if (count === 2) {
    const tileHeight = 180;
    return (
      <View
        style={[
          styles.imageGrid,
          { width: IMAGE_BUBBLE_WIDTH, height: tileHeight },
        ]}
      >
        {images.map((image, index) => (
          <ImageTile
            key={image.uri + index}
            image={image}
            onPress={() => onImagePress(index)}
            style={{
              width: columnWidth,
              height: tileHeight,
              marginRight: index === 0 ? IMAGE_GAP : 0,
            }}
          />
        ))}
      </View>
    );
  }

  if (count === 3) {
    const rightHeight = (IMAGE_GRID_HEIGHT - IMAGE_GAP) / 2;
    return (
      <View
        style={[
          styles.imageGrid,
          { width: IMAGE_BUBBLE_WIDTH, height: IMAGE_GRID_HEIGHT },
        ]}
      >
        <ImageTile
          image={images[0]}
          onPress={() => onImagePress(0)}
          style={{
            width: columnWidth,
            height: IMAGE_GRID_HEIGHT,
            marginRight: IMAGE_GAP,
          }}
        />
        <View style={styles.imageGridColumn}>
          <ImageTile
            image={images[1]}
            onPress={() => onImagePress(1)}
            style={{
              width: columnWidth,
              height: rightHeight,
              marginBottom: IMAGE_GAP,
            }}
          />
          <ImageTile
            image={images[2]}
            onPress={() => onImagePress(2)}
            style={{ width: columnWidth, height: rightHeight }}
          />
        </View>
      </View>
    );
  }

  const rowHeight = (IMAGE_GRID_HEIGHT - IMAGE_GAP) / 2;
  const visible = images.slice(0, 4);
  const extraCount = count - 3;

  return (
    <View
      style={[
        styles.imageGridWrap,
        { width: IMAGE_BUBBLE_WIDTH, height: IMAGE_GRID_HEIGHT },
      ]}
    >
      {visible.map((image, index) => {
        const isLast = index === 3 && count > 4;
        const col = index % 2;
        const row = Math.floor(index / 2);

        return (
          <ImageTile
            key={image.uri + index}
            image={image}
            overlay={isLast ? `+${extraCount}` : undefined}
            onPress={() => onImagePress(index)}
            style={{
              position: "absolute",
              left: col * (columnWidth + IMAGE_GAP),
              top: row * (rowHeight + IMAGE_GAP),
              width: columnWidth,
              height: rowHeight,
            }}
          />
        );
      })}
    </View>
  );
};

const ImageBubble = ({
  item,
  isSearchMatch = false,
  isActiveSearchMatch = false,
}: Props) => {
  const imageUrls = parseMmsMediaUrls(item.mmsMediaUrl);
  const images = imageUrls.map((uri) => ({ uri }));
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerVisible(false);
  }, []);

  if (images.length === 0) {
    return null;
  }

  const bubbleStyle = [
    styles.imageBubble,
    isSearchMatch && styles.searchMatch,
    isActiveSearchMatch && styles.searchMatchActive,
  ];

  return (
    <>
      {images.length === 1 ? (
        <View style={[...bubbleStyle, getSingleImageSize()]}>
          <ImageTile
            image={images[0]}
            onPress={() => openViewer(0)}
            style={styles.singleImage}
          />
        </View>
      ) : (
        <View style={bubbleStyle}>
          <ImageGrid images={images} onImagePress={openViewer} />
        </View>
      )}

      <ChatImageViewer
        visible={viewerVisible}
        images={imageUrls}
        initialIndex={viewerIndex}
        onClose={closeViewer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  imageBubble: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  searchMatch: {
    borderWidth: 2,
    borderColor: Colors.warning + "55",
  },
  searchMatchActive: {
    borderWidth: 3,
    borderColor: Colors.warning,
  },
  imageGrid: {
    flexDirection: "row",
  },
  imageGridWrap: {
    position: "relative",
  },
  imageGridColumn: {
    flexDirection: "column",
  },
  imageTile: {
    overflow: "hidden",
    backgroundColor: Colors.border,
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  moreOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black + "73",
  },
  moreOverlayText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xl,
    color: Colors.white,
  },
});

export default ImageBubble;
