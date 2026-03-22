import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from './src/screens/GameScreen';
import brazil from './src/config/brazil';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameScreen config={brazil} />
    </SafeAreaProvider>
  );
}
