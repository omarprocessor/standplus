import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default function BeaconScreen() {
  const manager = useRef(new BleManager()).current;
  const [devices, setDevices] = useState({});
  const [scanning, setScanning] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Request Bluetooth permissions
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        try {
          if (Platform.Version >= 31) {
            const granted = await PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            const allGranted = Object.values(granted).every(
              (status) => status === PermissionsAndroid.RESULTS.GRANTED
            );
            setReady(allGranted);
            if (!allGranted) setError('Bluetooth permissions not granted.');
          } else {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            setReady(granted === PermissionsAndroid.RESULTS.GRANTED);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED)
              setError('Location permission not granted.');
          }
        } catch (err) {
          setError(err.message);
        }
      } else {
        setReady(true);
      }
    }
    requestPermissions();

    // Cleanup on unmount
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, [manager]);

  // Start scanning for BLE devices
  const startScan = () => {
    if (!ready) return;
    setDevices({});
    setScanning(true);
    setError(null);

    manager.startDeviceScan(null, { allowDuplicates: true }, (err, device) => {
      if (err) {
        setError(err.message);
        setScanning(false);
        manager.stopDeviceScan();
        return;
      }

      if (device && device.rssi) {
        const id = device.id;
        const name = device.name || device.localName || 'Unknown';
        const rssi = device.rssi;

        setDevices((prev) => ({
          ...prev,
          [id]: { id, name, rssi },
        }));
      }
    });
  };

  // Stop scanning
  const stopScan = () => {
    manager.stopDeviceScan();
    setScanning(false);
  };

  // RSSI to distance formula (Path Loss Model)
  // txPower: typical beacon transmission power (-59 dBm for 1m distance)
  // n: path loss exponent (2 for free space, 2-4 for indoor)
  const rssiToDistance = (rssi, txPower = -59, n = 2) => {
    if (!rssi || rssi === -999) return null;
    const distance = Math.pow(10, (txPower - rssi) / (10 * n));
    return Math.max(0.1, distance); // Minimum 0.1m
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    if (distance < 1) return `${(distance * 100).toFixed(0)} cm`;
    if (distance < 100) return `${distance.toFixed(1)} m`;
    return `${distance.toFixed(0)} m`;
  };

  const data = useMemo(() => {
    const deviceList = Object.values(devices).map(device => ({
      ...device,
      distance: rssiToDistance(device.rssi),
    }));
    // Sort by distance (closest first)
    return deviceList.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      if (a.distance) return -1;
      if (b.distance) return 1;
      return (b.rssi ?? -999) - (a.rssi ?? -999);
    });
  }, [devices]);

  if (!ready)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00897B" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Initializing Bluetooth...</Text>
      </View>
    );

  if (error && !scanning)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={startScan}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Beacons</Text>
      <Text style={styles.subtitle}>
        {scanning
          ? `Scanning... Found ${data.length} beacon${data.length === 1 ? '' : 's'}`
          : 'Press Start to scan for beacons'}
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.id}>{item.id}</Text>
              <Text style={styles.rssi}>Signal: {item.rssi} dBm</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.distanceLabel}>Distance</Text>
              <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {scanning ? 'Searching for beacons...' : 'No beacons found'}
            </Text>
          </View>
        )}
      />

      {!scanning ? (
        <TouchableOpacity style={styles.button} onPress={startScan}>
          <Text style={styles.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopScan}
        >
          <Text style={styles.buttonText}>Stop Scanning</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  row: { 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowRight: { alignItems: 'flex-end' },
  name: { fontSize: 16, color: '#111827', fontWeight: '600', marginBottom: 4 },
  id: { fontSize: 11, color: '#9CA3AF', marginBottom: 4, fontFamily: 'monospace' },
  rssi: { fontSize: 12, color: '#6B7280' },
  distanceLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  distance: { fontSize: 20, color: '#00897B', fontWeight: '700' },
  sep: { height: 8 },
  button: {
    backgroundColor: '#00897B',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    minWidth: 160,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stopButton: { backgroundColor: '#EF4444' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  errorText: { textAlign: 'center', color: '#EF4444', marginBottom: 16, fontSize: 14, paddingHorizontal: 20 },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
