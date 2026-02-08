import React, { useState, useEffect } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, FlatList, TouchableOpacity, Alert } from 'react-native';
import { BluetoothManager, BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

const App = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

  // Minta Izin Bluetooth (Wajib untuk Android 12+)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const scanDevices = async () => {
    await requestPermissions();
    console.log("Memulai Scan...");
    BluetoothManager.scanDevices().then((s) => {
      let result = JSON.parse(s);
      setDevices(result.found || []);
    }).catch((err) => Alert.alert("Error", err.message));
  };

  const connectToPrinter = (address, name) => {
    BluetoothManager.connect(address).then(() => {
      setConnectedDevice(name);
      Alert.alert("Sukses", "Terhubung ke " + name);
    }).catch((err) => Alert.alert("Gagal Konek", err.message));
  };

  const printTest = async () => {
    try {
      await BluetoothEscposPrinter.printerInit();
      await BluetoothEscposPrinter.printerLeftSpace(0);
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("CEK BERHASIL\n", { fontweight: 1, widthtimes: 1 });
      await BluetoothEscposPrinter.printText("Suka Laundry / Azzam Proyek\n", {});
      await BluetoothEscposPrinter.printText("------------------------------\n", {});
      await BluetoothEscposPrinter.printText("Bluetooth Printer Work!\n\n\n", {});
    } catch (err) {
      Alert.alert("Error Cetak", err.message);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Printer Test Azzam</Text>
      <Text style={{ textAlign: 'center', marginBottom: 20 }}>Status: {connectedDevice ? `Terhubung ke ${connectedDevice}` : 'Belum Konek'}</Text>
      
      <Button title="1. Cari Printer" onPress={scanDevices} color="#2196F3" />
      
      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => connectToPrinter(item.address, item.name)}
            style={{ padding: 10, borderBottomWidth: 1, backgroundColor: 'white' }}>
            <Text>{item.name || "No Name"} ({item.address})</Text>
          </TouchableOpacity>
        )}
        style={{ marginVertical: 20 }}
      />

      {connectedDevice && (
        <Button title="2. Cetak Tulisan Cek" onPress={printTest} color="#4CAF50" />
      )}
    </View>
  );
};

export default App;
