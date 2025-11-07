import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ScanBuildingScreen from './src/screens/ScanBuildingScreen';
import NavigationAssistanceScreen from './src/screens/NavigationAssistanceScreen';
import SignupScreen from './src/screens/SignupScreen';
import MapScreen from './src/screens/MapScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import AskScreen from './src/screens/AskScreen';
import BeaconScreen from './src/screens/BeaconScreen';
import { useEffect, useState } from 'react';
import { bootstrapAuth } from './src/utils/authBootstrap';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const hasToken = await bootstrapAuth();
      setInitialRoute(hasToken ? 'Welcome' : 'Login');
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: true, title: 'Stand+' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Scan" component={ScanBuildingScreen} />
        <Stack.Screen name="Navigate" component={NavigationAssistanceScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="Ask" component={AskScreen} />
        <Stack.Screen name="Beacons" component={BeaconScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00897B',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111111',
    border: '#E5E7EB',
  },
};
