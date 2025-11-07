import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';

export default function WelcomeScreen({ navigation }) {
  useEffect(() => {
    Speech.speak('Welcome to Stand+. Tap anywhere to continue.');
  }, []);

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Menu')}>
      <View>
        <Text style={styles.text}>Welcome to Stand+{"\n"}Tap anywhere</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 24, textAlign: 'center' },
});


