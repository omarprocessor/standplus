import { EXPLORE_UPLOAD_URL, EXPLORE_ALL_IMAGES_URL } from '../config/apiConfig';

export async function uploadImage(uri) {
  const endpoint = EXPLORE_UPLOAD_URL;
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'photo.jpg';
  const mime = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  formData.append('image', {
    uri,
    name: filename,
    type: mime,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json().catch(() => ({}));
}

export async function fetchLatestAudioUrl() {
  const res = await fetch(EXPLORE_ALL_IMAGES_URL);
  if (!res.ok) throw new Error('Failed to fetch images');
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) return null;
  // Assume newest is first; fallback to last
  const item = list[0] || list[list.length - 1];
  return item?.tts_audio || null;
}



