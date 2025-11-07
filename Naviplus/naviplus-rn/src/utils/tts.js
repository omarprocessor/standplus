import * as Speech from 'expo-speech';

export function speak(text) {
  try {
    if (text && typeof text === 'string') {
      Speech.speak(text);
    }
  } catch {}
}

export async function speakAndNavigate({ navigation, routeName, params, text }) {
  speak(text);
  setTimeout(() => {
    navigation.navigate(routeName, params);
  }, 100);
}





