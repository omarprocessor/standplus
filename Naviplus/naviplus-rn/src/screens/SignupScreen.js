import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { api, login, setAuthToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    try {
      await api.post('/signup/', { username, password });
      const data = await login(username, password);
      const token = data?.token;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await setAuthToken(token);
        navigation.replace('Welcome');
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setError('Signup failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Create Account" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, padding: 10, borderRadius: 6 },
  error: { color: 'red', marginBottom: 12 },
});


