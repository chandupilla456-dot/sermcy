import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { JuiceDetailScreen } from './src/screens/JuiceDetailScreen';
import type { Juice } from './src/types/juice';
import "./global.css";   // or correct path
export default function App() {
  const [selected, setSelected] = useState<Juice | null>(null);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {selected ? (
          <JuiceDetailScreen juice={selected} onBack={() => setSelected(null)} />
        ) : (
          <HomeScreen onOpenJuice={setSelected} />
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
});
