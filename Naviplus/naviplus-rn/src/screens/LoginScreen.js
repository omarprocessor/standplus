import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, setAuthToken, getResolvedBaseUrl } from '../api/client';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const data = await login(username, password);
      const token = data?.token;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await setAuthToken(token);
        navigation.replace('Welcome');
      } else {
        setError('Login failed.');
      }
    } catch (e) {
      setError('Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Text style={styles.hint}>API: {getResolvedBaseUrl()}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator /> : <Button title="Login" onPress={onSubmit} />}
      <View style={{ height: 12 }} />
      <Button title="Go to Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, padding: 10, borderRadius: 6 },
  error: { color: 'red', marginBottom: 12 },
  hint: { color: '#6B7280', marginBottom: 8, fontSize: 12 },
});


