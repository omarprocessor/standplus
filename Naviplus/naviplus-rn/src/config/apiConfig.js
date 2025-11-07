import Constants from 'expo-constants';
import { Platform } from 'react-native';

function deriveHostFromExpo() {
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri || '';
  const match = hostUri.match(/^(.*?):\d+/);
  return match && match[1] ? match[1] : null;
}

export function normalizeBaseUrl(urlString) {
  try {
    const url = new URL(urlString);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!isLocal) return url.toString();
    if (Platform.OS === 'android') {
      url.hostname = '10.0.2.2';
      return url.toString();
    }
    const inferredHost = deriveHostFromExpo();
    if (inferredHost) {
      url.hostname = inferredHost;
      return url.toString();
    }
    return url.toString();
  } catch {
    return urlString;
  }
}

const configuredUrl = (Constants?.expoConfig?.extra?.backendUrl)
  || (Constants?.manifest?.extra?.backendUrl)
  || 'http://72.61.154.253:8001/api/';

export const BACKEND_BASE_URL = normalizeBaseUrl(configuredUrl);
export const DEFAULT_TIMEOUT_MS = 8000;

// External services
export const EXPLORE_UPLOAD_URL = 'http://72.61.154.253:8000/api/upload/';
export const EXPLORE_ALL_IMAGES_URL = 'http://72.61.154.253:8000/api/all-images/';
export const ASK_UPLOAD_URL = 'http://72.61.154.253:8000/api/upload-audio-gpt/';
export const ASK_ALL_QNA_URL = 'http://72.61.154.253:8000/api/all-audio-qna/';

export function getResolvedBaseUrl() {
  return BACKEND_BASE_URL;
}


