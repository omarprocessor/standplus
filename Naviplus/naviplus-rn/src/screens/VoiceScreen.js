import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function VoiceScreen() {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    setSpeaking(true);
    Speech.speak('Voice command screen');
    setTimeout(() => setSpeaking(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Text>Voice Screen</Text>
      <Button title={speaking ? 'Speaking...' : 'Speak'} onPress={speak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});





