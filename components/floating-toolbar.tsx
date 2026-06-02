import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DhuloTheme } from '@/lib/dhulo';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  bottom: number;
  bodySize: number;
  canRedo: boolean;
  canUndo: boolean;
  onAttachImage: () => void;
  onBodySizeChange: (size: number) => void;
  onRedo: () => void;
  onUndo: () => void;
  theme: DhuloTheme;
};

export const FloatingToolbar = memo(function FloatingToolbar({
  bodySize,
  bottom,
  canRedo,
  canUndo,
  onAttachImage,
  onBodySizeChange,
  onRedo,
  onUndo,
  theme,
}: Props) {
  return (
    <View
      style={[
        styles.toolbar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          bottom,
          shadowColor: theme.shadow,
        },
      ]}>
      <ToolbarIcon accessibilityLabel="Attach image" icon="image" onPress={onAttachImage} theme={theme} />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <ToolbarIcon accessibilityLabel="Undo" disabled={!canUndo} icon="undo" onPress={onUndo} theme={theme} />
      <ToolbarIcon accessibilityLabel="Redo" disabled={!canRedo} icon="redo" onPress={onRedo} theme={theme} />
      <View style={[styles.sizeGroup, { backgroundColor: theme.elevated }]}>
        <Pressable accessibilityRole="button" onPress={() => onBodySizeChange(Math.max(15, bodySize - 1))} style={styles.sizeButton}>
          <MaterialIcons name="remove" size={17} color={theme.text} />
        </Pressable>
        <Text style={[styles.sizeText, { color: theme.text }]}>{bodySize}</Text>
        <Pressable accessibilityRole="button" onPress={() => onBodySizeChange(Math.min(28, bodySize + 1))} style={styles.sizeButton}>
          <MaterialIcons name="add" size={17} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
});

function ToolbarIcon({
  accessibilityLabel,
  active,
  disabled,
  icon,
  onPress,
  theme,
}: {
  accessibilityLabel: string;
  active?: boolean;
  disabled?: boolean;
  icon: IconName;
  onPress: () => void;
  theme: DhuloTheme;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          backgroundColor: active ? theme.text : 'transparent',
          opacity: disabled ? 0.36 : 1,
        },
      ]}>
      <MaterialIcons name={icon} size={20} color={active ? theme.background : theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 28,
    width: StyleSheet.hairlineWidth,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 34,
  },
  sizeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 30,
  },
  sizeGroup: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 36,
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '900',
    minWidth: 22,
    textAlign: 'center',
  },
  toolbar: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    left: 14,
    padding: 8,
    position: 'absolute',
    right: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
});
