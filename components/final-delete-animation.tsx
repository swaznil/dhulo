import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { decayText, DHULO_THEMES, DhuloNote } from '@/lib/dhulo';
import { FINAL_DELETE_DURATION } from '@/utils/animation';

const FINAL_DELETE_FLAMES = Array.from({ length: 9 }, (_, index) => index);
const FINAL_DELETE_STRIPS = Array.from({ length: 8 }, (_, index) => index);

export function FinalDeleteAnimation({ note, onFinish }: { note: DhuloNote; onFinish: () => void }) {
  const theme = DHULO_THEMES[note.themeId];
  const motion = useRef(new Animated.Value(0)).current;
  const finishRef = useRef(onFinish);
  const duration = FINAL_DELETE_DURATION[note.decayStyle];
  const title = decayText(note.title, 0.92, note.decayStyle, `${note.id}-final-title`, 0);
  const body = decayText(note.body || 'This note is an image slowly disappearing.', 0.94, note.decayStyle, `${note.id}-final-body`, 0);
  const paperStyle =
    note.decayStyle === 'ash'
      ? {
          opacity: motion.interpolate({ inputRange: [0, 0.74, 1], outputRange: [1, 0.82, 0] }),
          transform: [
            { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, 56] }) },
            { scale: motion.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 0.96, 0.8] }) },
            { rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-3deg'] }) },
          ],
        }
      : note.decayStyle === 'blur'
        ? {
            opacity: motion.interpolate({ inputRange: [0, 0.48, 1], outputRange: [1, 0.46, 0] }),
            transform: [
              { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
              { scale: motion.interpolate({ inputRange: [0, 0.64, 1], outputRange: [1, 1.16, 1.42] }) },
            ],
          }
        : {
            opacity: motion.interpolate({ inputRange: [0, 0.76, 1], outputRange: [1, 0.94, 0] }),
            transform: [
              { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }) },
              { scaleX: motion.interpolate({ inputRange: [0, 0.62, 1], outputRange: [1, 1.38, 1.74] }) },
              { scaleY: motion.interpolate({ inputRange: [0, 0.62, 1], outputRange: [1, 0.74, 0.46] }) },
            ],
          };

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    motion.setValue(0);
    const animation = Animated.timing(motion, {
      duration,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        finishRef.current();
      }
    });

    return () => animation.stop();
  }, [duration, motion, note.id]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.backdrop, { opacity: motion.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 0.72, 0.62] }) }]} />
      <Animated.View style={[styles.paper, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }, paperStyle]}>
        {note.imageUri ? <Image blurRadius={note.decayStyle === 'blur' ? 16 : 3} source={{ uri: note.imageUri }} style={styles.image} /> : null}
        <Text numberOfLines={2} style={[styles.title, { color: note.decayStyle === 'ash' ? '#b45309' : theme.text }]}>
          {title}
        </Text>
        <Text
          numberOfLines={6}
          style={[
            styles.body,
            {
              color: note.decayStyle === 'ash' ? '#7c2d12' : theme.muted,
              letterSpacing: note.decayStyle === 'drift' ? 2.8 : 0,
            },
          ]}>
          {body}
        </Text>
        {note.decayStyle === 'ash' ? (
          <>
            <Animated.View style={[styles.burnWash, { opacity: motion.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.34, 0.9] }) }]} />
            <View style={styles.fireRow}>
              {FINAL_DELETE_FLAMES.map((flame) => (
                <Animated.View
                  key={flame}
                  style={[
                    styles.flame,
                    {
                      height: 44 + ((flame * 13) % 24),
                      opacity: motion.interpolate({ inputRange: [0, 0.24, 0.82, 1], outputRange: [0, 1, 0.82, 0] }),
                      transform: [
                        {
                          translateY: motion.interpolate({
                            inputRange: [0, 0.55, 1],
                            outputRange: [34, -8 - (flame % 3) * 6, -86],
                          }),
                        },
                        {
                          scaleX: motion.interpolate({
                            inputRange: [0, 0.62, 1],
                            outputRange: [0.68, 1 + (flame % 2) * 0.3, 0.3],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </>
        ) : null}
        {note.decayStyle === 'blur' ? (
          <Animated.View
            style={[
              styles.blurAura,
              {
                backgroundColor: theme.accent,
                opacity: motion.interpolate({ inputRange: [0, 0.36, 1], outputRange: [0, 0.28, 0] }),
                transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }) }],
              },
            ]}
          />
        ) : null}
        {note.decayStyle === 'drift' ? (
          <View style={styles.tearLayer}>
            {FINAL_DELETE_STRIPS.map((strip) => (
              <Animated.View
                key={strip}
                style={[
                  styles.tear,
                  {
                    backgroundColor: strip % 2 === 0 ? theme.elevated : theme.surface,
                    top: `${strip * 12 + 2}%`,
                    opacity: motion.interpolate({ inputRange: [0, 0.46, 1], outputRange: [0, 0.86, 0] }),
                    transform: [
                      {
                        translateX: motion.interpolate({
                          inputRange: [0, 0.56, 1],
                          outputRange: [0, (strip % 2 === 0 ? 1 : -1) * 28, (strip % 2 === 0 ? 1 : -1) * 260],
                        }),
                      },
                      { rotate: `${strip % 2 === 0 ? -2 : 2}deg` },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  blurAura: {
    borderRadius: 999,
    height: 240,
    left: '50%',
    marginLeft: -120,
    marginTop: -120,
    position: 'absolute',
    top: '50%',
    width: 240,
  },
  body: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 14,
  },
  burnWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111',
  },
  fireRow: {
    alignItems: 'flex-end',
    bottom: -14,
    flexDirection: 'row',
    gap: 4,
    left: -8,
    position: 'absolute',
    right: -8,
  },
  flame: {
    backgroundColor: '#f97316',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    flex: 1,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  image: {
    borderRadius: 8,
    height: 108,
    marginBottom: 14,
    width: '100%',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  paper: {
    borderRadius: 8,
    borderWidth: 1,
    elevation: 18,
    maxWidth: 360,
    minHeight: 280,
    overflow: 'hidden',
    padding: 22,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: '78%',
  },
  tear: {
    height: 8,
    left: -18,
    position: 'absolute',
    right: -18,
  },
  tearLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
});
