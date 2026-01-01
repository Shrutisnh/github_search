import React, {
    forwardRef,
    ReactNode,
    useImperativeHandle,
    useState,
} from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

export type BottomSheetRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  children: ReactNode;
  sheetStyle?: ViewStyle;
};

const DynamicBottomSheet = forwardRef<BottomSheetRef, Props>(
  ({ children, sheetStyle }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        {/* Overlay */}
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        />

        {/* Bottom Sheet */}
        <View style={[styles.sheet, sheetStyle]}>
          {children}
        </View>
      </Modal>
    );
  }
);

export default DynamicBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#ffffff', // 🔑 prevents transparency
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
