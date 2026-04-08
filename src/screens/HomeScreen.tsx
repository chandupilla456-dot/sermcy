import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JuiceCard } from '../components/JuiceCard';
import { JUICES } from '../data/juices';
import type { Juice } from '../types/juice';

type Props = {
  onOpenJuice: (juice: Juice) => void;
};

export function HomeScreen({ onOpenJuice }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Fresh today · juices-app</Text>
        <Text style={styles.title}>Juices</Text>
        <Text style={styles.subtitle}>Tap a blend for ingredients & pricing</Text>
      </View>
      <FlatList
        data={JUICES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <JuiceCard juice={item} onPress={() => onOpenJuice(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D6A4F',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#14241a',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#5c5c5c',
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});
