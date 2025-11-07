import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { fetchNavigationSteps } from '../api/client';

export default function NavigationAssistanceScreen() {
  const [buildingId, setBuildingId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [steps, setSteps] = useState([]);

  const onFetch = async () => {
    if (!buildingId || !start || !end) return;
    const s = await fetchNavigationSteps({ buildingId: Number(buildingId), start, end });
    setSteps(s);
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Building ID" value={buildingId} onChangeText={setBuildingId} style={styles.input} />
      <TextInput placeholder="Start" value={start} onChangeText={setStart} style={styles.input} />
      <TextInput placeholder="End" value={end} onChangeText={setEnd} style={styles.input} />
      <Button title="Get Steps" onPress={onFetch} />
      <FlatList
        data={steps}
        keyExtractor={(item, idx) => String(idx)}
        renderItem={({ item }) => <Text style={styles.item}>• {item}</Text>}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, padding: 10, borderRadius: 6 },
  item: { paddingVertical: 6 },
});





