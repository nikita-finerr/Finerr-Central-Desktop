import { forwardRef } from "react";
import type { ScrollViewProps } from "react-native";
import {
  KeyboardChatScrollView,
  type KeyboardChatScrollViewProps,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Ref = React.ElementRef<typeof KeyboardChatScrollView>;

const ChatScrollView = forwardRef<
  Ref,
  ScrollViewProps & KeyboardChatScrollViewProps
>(({ inverted, ...props }, ref) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <KeyboardChatScrollView
      ref={ref}
      inverted={inverted}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode="interactive"
      {...props}
    />
  );
});

ChatScrollView.displayName = "ChatScrollView";

export default ChatScrollView;
