import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Switch
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';
import ColorPicker from 'react-native-wheel-color-picker';

export default function OpcionesScreen() {
  const { isDarkMode, setIsDarkMode, accentColor, setAccentColor, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(accentColor);

  const handleColorChange = (color) => {
    setTempColor(color);
  };

  const saveColor = () => {
    setAccentColor(tempColor);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apariencia</Text>

        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            setTempColor(accentColor);
            setModalVisible(true);
          }}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="palette" size={24} color={accentColor} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Personalizar Tema</Text>
            <Text style={styles.optionSubtitle}>Selector de color avanzado</Text>
          </View>
          <View style={[styles.colorPreview, { backgroundColor: accentColor }]} />
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* --- MODAL DE PERSONALIZACIÓN --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Personalizar</Text>

              {/* SECCIÓN DEL SWITCH DELIMITADA */}
              <View style={[
                styles.darkModeBox,
                { backgroundColor: theme.dark ? '#2A2A2A' : '#F0F0F0' }
              ]}>
                <View style={styles.settingRow}>
                  <View style={styles.rowInfo}>
                    <MaterialCommunityIcons
                      name={isDarkMode ? "weather-night" : "weather-sunny"}
                      size={20}
                      color={theme.colors.text}
                    />
                    <Text style={[styles.rowText, { color: theme.colors.text }]}>Modo Oscuro</Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: "#767577", true: accentColor }}
                    thumbColor={isDarkMode ? accentColor : "#f4f3f4"}
                  />
                </View>
              </View>

              {/* Etiqueta para el Color Picker */}
              <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>Color de énfasis</Text>

              {/* COLOR PICKER AVANZADO */}
              <View style={styles.pickerContainer}>
                <ColorPicker
                  color={tempColor}
                  onColorChange={handleColorChange}
                  thumbSize={25}
                  sliderSize={25}
                  noSnap={true}
                  row={false}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: tempColor }]}
                  onPress={saveColor}
                >
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 20 },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, elevation: 2 },
  iconContainer: { marginRight: 15 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionSubtitle: { fontSize: 12, color: '#888' },
  colorPreview: { width: 20, height: 20, borderRadius: 10, marginRight: 10 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: 550, padding: 20, borderRadius: 25, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  // Nuevo estilo para delimitar el modo oscuro
  darkModeBox: {
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  pickerContainer: { flex: 1, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#EEE' },
  cancelBtnText: { color: '#333', fontWeight: 'bold' },
  saveBtnText: { color: 'white', fontWeight: 'bold' }
});