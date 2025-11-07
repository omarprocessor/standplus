import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';

export async function bootstrapAuth() {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      await setAuthToken(token);
      return true;
    }
  } catch {}
  return false;
}





