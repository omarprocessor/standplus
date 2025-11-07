import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { fetchBuildingDetails } from '../api/client';

export default function ScanBuildingScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState('');
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  if (!permission) return <ActivityIndicator style={{ marginTop: 24 }} />;
  if (!permission.granted) return <Text style={styles.error}>No camera access</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.scannerBox}>
        <CameraView
          onBarcodeScanned={
            scanned
              ? undefined
              : async ({ data: qr }) => {
                  setScanned(true);
                  setData(qr);
                  setError(null);
                  setBuilding(null);
                  // Try to extract building ID from URL like .../buildings/1/
                  try {
                    const match = String(qr).match(/\/buildings\/(\d+)\/?/);
                    if (match && match[1]) {
                      setLoading(true);
                      const b = await fetchBuildingDetails(Number(match[1]));
                      setBuilding(b);
                    }
                  } catch (e) {
                    setError('Failed to fetch building details');
                  } finally {
                    setLoading(false);
                  }
                }
          }
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <View style={{ height: 12 }} />
      {scanned ? (
        <Button title="Scan Again" onPress={() => { setScanned(false); setData(''); }} />
      ) : (
        <Text style={styles.hint}>Point the camera at a QR code</Text>
      )}
      <View style={{ height: 12 }} />
      {data ? <Text selectable style={styles.result}>{data}</Text> : null}
      {loading ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {building ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Building Details</Text>
          <Text>ID: {building.id}</Text>
          <Text>Name: {building.name}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  scannerBox: { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  error: { color: 'red', padding: 16 },
  hint: { color: '#6B7280', textAlign: 'center' },
  result: { fontSize: 14, color: '#111827' },
  card: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF' },
  cardTitle: { fontWeight: '600', marginBottom: 6 },
});


