import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { uploadQuestionAudio, fetchLatestQnaAudioUrl } from '../api/ask';

export default function AskScreen() {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);

  useEffect(() => {
    Speech.stop();
    Speech.speak('Ask mode. Tap anywhere on the screen to record your question.');
  }, []);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (playingSound) {
            await playingSound.stopAsync();
            await playingSound.unloadAsync();
          }
        } catch {}
      })();
    };
  }, [playingSound]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone permission denied');
        Speech.speak('Microphone permission denied.');
        return;
      }

      // Step 1: Stop any ongoing speech
      Speech.stop();

      // Step 2: Speak *before* recording starts
      await new Promise((resolve) => {
        Speech.speak('Recording will start in a moment.', {
          onDone: resolve,
          onStopped: resolve,
          onError: resolve,
        });
      });

      // Step 3: Wait a tiny bit for speaker to silence
      await new Promise((r) => setTimeout(r, 500));

      // Step 4: Prepare audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
      });

      // Step 5: Start recording silently
      const recOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      const { recording } = await Audio.Recording.createAsync(recOptions);
      recordingRef.current = recording;
      setIsRecording(true);

      // (no TTS while recording)
    } catch (e) {
      setError('Failed to start recording');
      Speech.speak('Failed to start recording.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = rec.getURI();
      recordingRef.current = null;

      setUploading(true);
      Speech.speak('Recording stopped. Processing your question. Please wait.');

      const beforeUrl = await fetchLatestQnaAudioUrl().catch(() => null);
      await uploadQuestionAudio(uri);

      const deadline = Date.now() + 60000; // 60 seconds timeout
      let latest = beforeUrl;
      await new Promise((r) => setTimeout(r, 1500));

      while (Date.now() < deadline) {
        try {
          const url = await fetchLatestQnaAudioUrl();
          if (url && url !== latest) {
            Speech.speak('Here is the answer.');
            if (playingSound) {
              await playingSound.stopAsync();
              await playingSound.unloadAsync();
            }
            const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
            setPlayingSound(sound);

            // After playback finishes, prompt user again
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                Speech.speak('You can tap again to ask another question.');
              }
            });

            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (e) {
      setError('Failed to stop or upload recording');
      Speech.speak('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [playingSound]);

  const handleTap = async () => {
    if (uploading) return;
    if (!isRecording) await startRecording();
    else await stopRecording();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={1}
      accessible={true}
      accessibilityLabel="Tap anywhere to start or stop recording"
    >
      <View>
        <Text style={styles.text}>
          {isRecording
            ? 'Recording... Tap anywhere to stop.'
            : uploading
            ? 'Processing your question...'
            : 'Tap anywhere to start recording.'}
        </Text>
        {uploading && <ActivityIndicator style={{ marginTop: 20 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 22, textAlign: 'center', paddingHorizontal: 16 },
  error: { color: 'red', marginTop: 12 },
});
