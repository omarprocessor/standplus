import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { uploadImage, fetchLatestAudioUrl } from '../api/explore';

export default function ExploreScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);

  // Speak the initial instruction
  useEffect(() => {
    Speech.stop();
    Speech.speak('Tap anywhere on the screen to take a picture.');
  }, []);

  const stopCurrent = async () => {
    try {
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }
    } catch {}
    setCurrentSound(null);
  };

  const takePhoto = async () => {
    setError(null);

    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPerm.status !== 'granted') {
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libPerm.status !== 'granted') {
          setError('Camera and library permission denied.');
          Speech.speak('Camera and library permission denied.');
          return;
        }

        const picked = await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!picked.canceled) {
          const uri = picked.assets?.[0]?.uri;
          setImageUri(uri || null);
          Speech.speak('Photo selected. Processing, please wait.');
          await handleUpload(uri);
        } else {
          Speech.speak('No image selected.');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        setImageUri(uri || null);
        Speech.speak('Photo captured. Processing, please wait.');
        await handleUpload(uri);
      } else {
        Speech.speak('No photo captured.');
      }
    } catch (e) {
      setError('Failed to take picture.');
      Speech.speak('Failed to take picture.');
    }
  };

  const handleUpload = async (uri) => {
    if (!uri) return;
    setUploading(true);
    setError(null);

    try {
      await stopCurrent();
      Speech.speak('Processing your photo. Please wait.');
      await uploadImage(uri);

      const deadline = Date.now() + 60000;
      let latestUrl = null;
      await new Promise(r => setTimeout(r, 1500));

      while (Date.now() < deadline) {
        try {
          const url = await fetchLatestAudioUrl();
          if (url && url !== latestUrl) {
            Speech.stop();
            Speech.speak('Here is the result.');
            const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
            setCurrentSound(sound);
            return;
          }
        } catch {}
        await new Promise(r => setTimeout(r, 1500));
      }

      Speech.speak('No response received. Please try again.');
      setError('No response received.');
    } catch (e) {
      setError('Upload failed.');
      Speech.speak('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTap = async () => {
    if (uploading || playing) return; // prevent double actions
    await takePhoto();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={1}
      accessible={true}
      accessibilityLabel="Tap anywhere to take a picture"
    >
      <View>
        <Text style={styles.text}>
          {uploading
            ? 'Processing your photo...'
            : 'Tap anywhere to take a picture.'}
        </Text>

        {uploading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 20, textAlign: 'center', paddingHorizontal: 16 },
  preview: { marginTop: 20, width: 200, height: 200, borderRadius: 10 },
  error: { color: 'red', marginTop: 12 },
});
