import React, { useState } from 'react';
import {
  View,  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';
import ColorPicker from 'react-native-wheel-color-picker';

// Importamos useGastos para las acciones de borrado
import { useGastos } from '../hooks/useGastos';

export default function OpcionesScreen({ navigation }) {
  const { isDarkMode, setIsDarkMode, accentColor, setAccentColor, theme } = useTheme();
  const { limpiarGastos, eliminarTodo } = useGastos(); // Asumiendo que existen en tu hook

  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(accentColor);

  const handleColorChange = (color) => {
    setTempColor(color);
  };

  const saveColor = () => {
    setAccentColor(tempColor);
    setModalVisible(false);
  };

  // Función para confirmar borrado de datos
  const confirmarAccion = (tipo) => {
    const esBorradoTotal = tipo === 'todo';
    Alert.alert(
      esBorradoTotal ? "Eliminar Todo" : "Reiniciar Montos",
      esBorradoTotal
        ? "¿Estás seguro de borrar todos los gastos y categorías? Esta acción es permanente."
        : "¿Seguro que quieres poner todos los gastos en $0 manteniendo las categorías?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => esBorradoTotal ? eliminarTodo() : limpiarGastos()
        }
      ]
    );
  };

  // Componente reutilizable para los botones de opción
  const OptionButton = ({ icon, title, subtitle, onPress, isDestructive = false }) => (
    <TouchableOpacity
      style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FF444422' : accentColor + '22' }]}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isDestructive ? '#FF4444' : accentColor}
        />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, { color: isDestructive ? '#FF4444' : theme.colors.text }]}>
          {title}
        </Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apariencia</Text>

        <OptionButton
          icon="palette"
          title="Personalizar Tema"
          subtitle="Modo oscuro y color de la app"
          onPress={() => {
            setTempColor(accentColor);
            setModalVisible(true);
          }}
        />

        <OptionButton
          icon="tag-multiple"
          title="Gestionar Categorías"
          subtitle="Añadir o eliminar categorías y sus colores"
          onPress={() => navigation.navigate('GestionCategoriasScreen')}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Datos y Cuenta</Text>

        <OptionButton
          icon="file-pdf-box"
          title="Exportar Reporte"
          subtitle="Enviar datos en PDF o JSON por mail"
          onPress={() => Alert.alert("Próximamente", "Esta función estará disponible en la siguiente actualización きっとmaybe.")}
        />

        <Text style={[styles.sectionTitle, { color: '#FF4444' }]}>Zona de Peligro</Text>

        <OptionButton
          icon="refresh"
          title="Reiniciar montos a $0"
          subtitle="Limpiar gastos del mes actual"
          onPress={() => confirmarAccion('limpiar')}
          isDestructive
        />

        <OptionButton
          icon="trash-can"
          title="Borrar todos los datos"
          subtitle="Eliminar gastos e historial completo"
          onPress={() => confirmarAccion('todo')}
          isDestructive
        />

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

              <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>Color de énfasis</Text>

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
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 25,
    textTransform: 'uppercase',
    opacity: 0.6
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: 550, padding: 20, borderRadius: 25, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

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