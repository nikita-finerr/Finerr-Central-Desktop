import ReactNativeHapticFeedback, {
  type HapticFeedbackTypes,
} from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const ImpactFeedbackStyle = {
  Light: "impactLight",
  Medium: "impactMedium",
  Heavy: "impactHeavy",
} as const;

type ImpactStyle =
  (typeof ImpactFeedbackStyle)[keyof typeof ImpactFeedbackStyle];

const trigger = (type: HapticFeedbackTypes | string) => {
  ReactNativeHapticFeedback.trigger(type as HapticFeedbackTypes, options);
};

export const Haptics = {
  ImpactFeedbackStyle,
  impactAsync: async (style: ImpactStyle = ImpactFeedbackStyle.Medium) => {
    trigger(style);
  },
  selectionAsync: async () => {
    trigger("selection");
  },
};
