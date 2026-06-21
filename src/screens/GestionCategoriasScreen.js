import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGastos } from '../hooks/useGastos';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import ColorPicker from 'react-native-wheel-color-picker';

export default function GestionCategoriasScreen() {
  const { theme, accentColor } = useTheme();
  const { categorias, agregarCategoria, eliminarCategoria, editarCategoria } = useGastos();

  // Estados para el Modal de Edición/Creación
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [nombre, setNombre] = useState('');
  const [tempColor, setTempColor] = useState(accentColor);

  const abrirEditor = (cat = null) => {
    if (cat) {
      setEditandoId(cat.id);
      setNombre(cat.nombre);
      setTempColor(cat.color);
    } else {
      setEditandoId(null);
      setNombre('');
      setTempColor(accentColor);
    }
    setModalVisible(true);
  };

  const handleGuardar = () => {
    if (!nombre.trim()) return;

    if (editandoId) {
      editarCategoria(editandoId, { nombre: nombre.trim(), color: tempColor });
    } else {
      agregarCategoria({ nombre: nombre.trim(), color: tempColor });
    }
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <View style={styles.content}>
        <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Categorías</Text>
            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: accentColor }]}
                onPress={() => abrirEditor()}
            >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <FlatList
          data={categorias}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catItem, { backgroundColor: theme.colors.card }]}
              onPress={() => abrirEditor(item)}
            >
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.catName, { color: theme.colors.text }]}>{item.nombre}</Text>
              <TouchableOpacity onPress={() => eliminarCategoria(item.id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editandoId ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.dark ? '#2A2A2A' : '#F5F5F5', color: theme.colors.text }]}
              placeholder="Nombre de la categoría"
              placeholderTextColor="#888"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Color de categoría</Text>

            <View style={styles.pickerContainer}>
                <ColorPicker
                    color={tempColor}
                    onColorChange={setTempColor}
                    thumbSize={25}
                    sliderSize={25}
                    noSnap={true}
                    row={false}
                />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleGuardar}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900' },
  addBtn: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  catItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 15 },
  catName: { flex: 1, fontSize: 16, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: 550, padding: 25, borderRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10, opacity: 0.6, textTransform: 'uppercase' },
  pickerContainer: { flex: 1, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 0.48, padding: 15, borderRadius: 12, backgroundColor: '#EEE', alignItems: 'center' },
  cancelBtnText: { color: '#333', fontWeight: 'bold' },
  saveBtn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold' }
});
