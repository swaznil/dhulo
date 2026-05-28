import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { DecayStyle, clamp } from '@/lib/dhulo';

type DecayImageProps = {
  uri?: string;
  progress: number;
  styleId: DecayStyle;
  accent: string;
  surface: string;
};

const GRID_CELLS = Array.from({ length: 36 }, (_, index) => index);
const SCAN_LINES = Array.from({ length: 10 }, (_, index) => index);

function DecayImageInner({ uri, progress, styleId, accent, surface }: DecayImageProps) {
  if (!uri) {
    return null;
  }

  const decay = clamp(progress);
  const blur =
    styleId === 'blur'
      ? decay * 22
      : styleId === 'ash'
        ? decay * 3
        : styleId === 'scramble'
          ? decay * 9
        : decay * 5;
  const pixelOpacity = styleId === 'drift' ? decay * 0.42 : styleId === 'blur' ? decay * 0.18 : decay * 0.68;

  return (
    <View style={[styles.frame, { backgroundColor: surface }]}>
      <Image
        source={{ uri }}
        blurRadius={blur}
        resizeMode="cover"
        style={[styles.image, { opacity: Math.max(0.16, 1 - decay * 0.7) }]}
      />
      <View style={styles.grid} pointerEvents="none">
        {GRID_CELLS.map((cell) => {
          const column = cell % 6;
          const row = Math.floor(cell / 6);
          const phase = ((cell * 17) % 23) / 23;
          const visible = decay > phase * 0.85;

          return (
            <View
              key={cell}
              style={[
                styles.cell,
                {
                  left: `${column * 16.67}%`,
                  top: `${row * 16.67}%`,
                  opacity: visible ? pixelOpacity * (0.35 + phase) : 0,
                  backgroundColor: cell % 3 === 0 ? accent : surface,
                  transform: [
                    { translateY: styleId === 'drift' ? decay * (row - 2) * 4 : 0 },
                    { rotate: '0deg' },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
      {styleId === 'ash' ? (
        <View style={styles.burnLayer} pointerEvents="none">
          <View style={[styles.burnEdge, { opacity: decay * 0.78 }]} />
          <View style={[styles.emberGlow, { opacity: decay * 0.5 }]} />
        </View>
      ) : null}
      {styleId === 'blur' ? (
        <View style={styles.scanLayer} pointerEvents="none">
          {SCAN_LINES.map((line) => (
            <View
              key={line}
              style={[
                styles.scanLine,
                {
                  backgroundColor: line % 2 === 0 ? accent : surface,
                  opacity: decay * 0.16,
                  top: `${line * 10 + ((decay * 17) % 8)}%`,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
      <View style={[styles.wash, { opacity: decay * (styleId === 'ash' ? 0.3 : 0.4), backgroundColor: surface }]} />
    </View>
  );
}

export const DecayImage = memo(DecayImageInner, (prev, next) => {
  return prev.uri === next.uri && prev.progress === next.progress && prev.styleId === next.styleId && prev.accent === next.accent && prev.surface === next.surface;
});

const styles = StyleSheet.create({
  frame: {
    borderRadius: 8,
    height: 168,
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  cell: {
    height: '16.67%',
    position: 'absolute',
    width: '16.67%',
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  scanLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  scanLine: {
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  burnLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  burnEdge: {
    backgroundColor: '#f97316',
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 14,
  },
  emberGlow: {
    backgroundColor: '#facc15',
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
});
