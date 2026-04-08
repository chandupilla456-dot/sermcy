import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Juice } from '../types/juice';

type Props = {
  juice: Juice;
  onBack: () => void;
};

export function JuiceDetailScreen({ juice, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          hitSlop={12}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroStripe, { backgroundColor: juice.accent }]} />
        <Text style={styles.name}>{juice.name}</Text>
        <Text style={styles.tagline}>{juice.tagline}</Text>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.price}>{juice.price}</Text>
        <Text style={styles.sectionTitle}>What’s inside</Text>
        {juice.ingredients.map((line) => (
          <View key={line} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: juice.accent }]} />
            <Text style={styles.ingredient}>{line}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backPressed: {
    opacity: 0.6,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  heroStripe: {
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    width: 72,
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#14241a',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 17,
    color: '#5c5c5c',
    marginBottom: 24,
    lineHeight: 24,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14241a',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  ingredient: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
