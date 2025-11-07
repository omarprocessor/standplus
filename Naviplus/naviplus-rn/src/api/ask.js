import { ASK_UPLOAD_URL, ASK_ALL_QNA_URL } from '../config/apiConfig';

export async function uploadQuestionAudio(uri) {
  const endpoint = ASK_UPLOAD_URL;
  const formData = new FormData();

  const rawName = uri.split('/').pop() || 'recording.m4a';
  const lower = rawName.toLowerCase();
  const isMp3 = lower.endsWith('.mp3');
  const isWav = lower.endsWith('.wav');
  const isM4a = lower.endsWith('.m4a') || lower.endsWith('.mp4') || lower.endsWith('.aac');
  // Prefer keeping correct MIME, but many backends only care about field name
  const name = isMp3 || isWav || isM4a ? rawName : `${rawName}.m4a`;
  const type = isMp3 ? 'audio/mpeg' : isWav ? 'audio/wav' : 'audio/mp4';

  const filePart = { uri, name, type };

  // Attach under the expected field name per server example: -F "audio=@file.wav"
  formData.append('audio', filePart);
  // Also include alternates for compatibility
  formData.append('audio_file', filePart);
  formData.append('file', filePart);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  if (!res.ok) {
    let msg = 'Upload failed';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || 'Upload failed');
  }
  return res.json().catch(() => ({}));
}

export async function fetchLatestQnaAudioUrl() {
  const res = await fetch(ASK_ALL_QNA_URL);
  if (!res.ok) throw new Error('Fetch failed');
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) return null;
  const item = list[0] || list[list.length - 1];
  return item?.tts_audio || null;
}


