import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { speakAndNavigate } from '../utils/tts';

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Ask and Explore first */}
      <Button title="Ask" onPress={() => speakAndNavigate({ navigation, routeName: 'Ask', text: 'Ask' })} />
      <View style={{ height: 8 }} />
      <Button title="Explore" onPress={() => speakAndNavigate({ navigation, routeName: 'Explore', text: 'Explore' })} />
      <View style={{ height: 8 }} />

      {/* Then the rest */}
      <Button title="Voice" onPress={() => speakAndNavigate({ navigation, routeName: 'Voice', text: 'Voice' })} />
      <View style={{ height: 8 }} />
      <Button title="Scan Building" onPress={() => speakAndNavigate({ navigation, routeName: 'Scan', text: 'Scan Building' })} />
      <View style={{ height: 8 }} />
      <Button title="Navigate" onPress={() => speakAndNavigate({ navigation, routeName: 'Navigate', text: 'Navigate' })} />
      <View style={{ height: 8 }} />
      <Button title="Map" onPress={() => speakAndNavigate({ navigation, routeName: 'Map', text: 'Map' })} />
      <View style={{ height: 8 }} />
      <Button title="Beacons" onPress={() => speakAndNavigate({ navigation, routeName: 'Beacons', text: 'Beacons' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
});
