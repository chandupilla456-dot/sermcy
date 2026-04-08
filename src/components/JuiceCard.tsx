import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Juice } from '../types/juice';

type Props = {
  juice: Juice;
  onPress: () => void;
};

export function JuiceCard({ juice, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.accent, { backgroundColor: juice.accent }]} />
      <View style={styles.body}>
        <Text style={styles.name}>{juice.name}</Text>
        <Text style={styles.tagline}>{juice.tagline}</Text>
        <Text style={styles.price}>{juice.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  accent: {
    width: 6,
  },
  body: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#5c5c5c',
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D6A4F',
  },
});
