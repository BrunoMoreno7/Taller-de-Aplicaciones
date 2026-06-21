import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGastos } from '../hooks/useGastos';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';

export default function GestionCategoriasScreen() {
  const { theme, accentColor } = useTheme();
  const { categorias, agregarCategoria, eliminarCategoria } = useGastos();
  const [nombre, setNombre] = useState('');

  const handleAdd = () => {
    if (!nombre.trim()) return;
    if (categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      Alert.alert("Error", "Esta categoría ya existe.");
      return;
    }
    agregarCategoria({
      id: Date.now().toString(),
      nombre: nombre.trim(),
      color: accentColor
    });
    setNombre('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Gestionar Categorías</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            placeholder="Nombre de categoría..."
            placeholderTextColor="#888"
            value={nombre}
            onChangeText={setNombre}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: accentColor }]}
            onPress={handleAdd}
          >
            <MaterialCommunityIcons name="plus" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={categorias}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.catItem, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.catName, { color: theme.colors.text }]}>{item.nombre}</Text>
              <TouchableOpacity onPress={() => eliminarCategoria(item.id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 20 },
  inputBox: { flexDirection: 'row', marginBottom: 25 },
  input: { flex: 1, borderRadius: 12, padding: 15, marginRight: 10, fontSize: 16 },
  addBtn: { width: 55, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  catName: { flex: 1, fontSize: 16, fontWeight: '600' }
});