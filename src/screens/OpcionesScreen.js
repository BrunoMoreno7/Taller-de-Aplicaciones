import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Switch, FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';

const PRESET_COLORS = ['#6200EE', '#007AFF', '#4CAF50', '#FF9800', '#E91E63', '#000000'];

export default function OpcionesScreen() {
  const { isDarkMode, setIsDarkMode, accentColor, setAccentColor, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apariencia</Text>

        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="palette" size={24} color={accentColor} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Personalizar Tema</Text>
            <Text style={styles.optionSubtitle}>Colores y Modo Oscuro</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* --- MODAL DE PERSONALIZACIÓN --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Personalizar</Text>

              {/* Toggle Modo Oscuro */}
              <View style={styles.settingRow}>
                <Text style={{ color: theme.colors.text, fontSize: 16 }}>Modo Oscuro</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: "#767577", true: accentColor }}
                />
              </View>

              {/* Color Picker */}
              <Text style={[styles.label, { color: theme.colors.text }]}>Color de énfasis</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color, borderWidth: accentColor === color ? 3 : 0 }
                    ]}
                    onPress={() => setAccentColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: accentColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Listo</Text>
              </TouchableOpacity>
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

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  label: { fontSize: 16, marginBottom: 15 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 25 },
  colorCircle: { width: 45, height: 45, borderRadius: 22.5, margin: 8, borderColor: '#FFF' },
  closeButton: { padding: 15, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { color: 'white', fontWeight: 'bold' }
});