import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';
import ColorPicker from 'react-native-wheel-color-picker';

// Importamos useGastos
import { useGastos } from '../hooks/useGastos';

export default function OpcionesScreen({ navigation }) {
  const { isDarkMode, setIsDarkMode, accentColor, setAccentColor, theme } = useTheme();

  // Extraemos todas las funciones necesarias del hook
  const {
    limpiarGastos,
    eliminarTodo,
    exportarDatos,
    importarDatos
  } = useGastos();

  const [modalVisible, setModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [borrarTodoModalVisible, setBorrarTodoModalVisible] = useState(false); // Modal extra para borrar todo
  const [tempColor, setTempColor] = useState(accentColor);
  const [procesando, setProcesando] = useState(false);

  // --- LÓGICA DE EXPORTACIÓN ---
  const handleExportar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const resultado = await exportarDatos();
      if (!resultado.ok) {
        Alert.alert('Error al exportar', resultado.error || 'No se pudo generar el archivo.');
      } else {
        Alert.alert('Exportación lista', `Se exportaron ${resultado.totalGastos} gastos en formato JSON.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado al exportar.');
    } finally {
      setProcesando(false);
    }
  };

  // --- LÓGICA DE IMPORTACIÓN ---
  const handleImportar = () => {
    if (Platform.OS === 'web') {
      // En web, el confirm nativo es más confiable para acciones rápidas
      const conf = window.confirm("¿Deseas REEMPLAZAR tus datos actuales? (Aceptar para Reemplazar, Cancelar para Combinar)");
      ejecutarImportacion(conf ? 'reemplazar' : 'combinar');
    } else {
      Alert.alert(
        'Importar Datos',
        '¿Cómo querés importar el archivo JSON?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Combinar', onPress: () => ejecutarImportacion('combinar') },
          { text: 'Reemplazar todo', style: 'destructive', onPress: () => ejecutarImportacion('reemplazar') },
        ]
      );
    }
  };

  const ejecutarImportacion = async (modo) => {
    setProcesando(true);
    try {
      // Llamada directa al hook
      const resultado = await importarDatos({ modo });

      if (resultado.cancelado) {
        setProcesando(false);
        return;
      }

      if (!resultado.ok) {
        // En Web usamos alert nativo si Alert de RN falla
        const msg = resultado.error || 'No se pudo leer el archivo.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      } else {
        const msgExito = `¡Éxito! Se importaron ${resultado.totalGastos} gastos y ${resultado.totalCategorias} categorías.`;
        Platform.OS === 'web' ? alert(msgExito) : Alert.alert('Importación completa', msgExito);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const saveColor = () => {
    setAccentColor(tempColor);
    setModalVisible(false);
  };

  const ejecutarReinicio = () => {
    limpiarGastos();
    setResetModalVisible(false);
    if (Platform.OS === 'web') alert("Montos reiniciados a $0");
  };

  const ejecutarBorradoTotal = () => {
    eliminarTodo();
    setBorrarTodoModalVisible(false);
    if (Platform.OS === 'web') alert("Todos los datos han sido eliminados");
  };

  const OptionButton = ({ icon, title, subtitle, onPress, isDestructive = false }) => (
    <TouchableOpacity
      style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={procesando}
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
      {procesando && isDestructive ? (
         <ActivityIndicator size="small" color="#FF4444" />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        {procesando && <ActivityIndicator color={accentColor} style={{marginBottom: 10}} />}

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
          icon="download"
          title="Exportar Datos (JSON)"
          subtitle="Crear una copia de seguridad"
          onPress={handleExportar}
        />
        <OptionButton
          icon="upload"
          title="Importar Datos (JSON)"
          subtitle="Restaurar desde un archivo"
          onPress={handleImportar}
        />

        <Text style={[styles.sectionTitle, { color: '#FF4444' }]}>Zona de Peligro</Text>
        <OptionButton
          icon="refresh"
          title="Reiniciar montos a $0"
          subtitle="Limpiar gastos del mes actual"
          onPress={() => setResetModalVisible(true)}
          isDestructive
        />
        <OptionButton
          icon="trash-can"
          title="Borrar todos los datos"
          subtitle="Eliminar gastos e historial completo"
          onPress={() => setBorrarTodoModalVisible(true)}
          isDestructive
        />

        {/* MODAL COLOR */}
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Personalizar</Text>
              <View style={[styles.darkModeBox, { backgroundColor: theme.dark ? '#2A2A2A' : '#F0F0F0' }]}>
                <View style={styles.settingRow}>
                  <Text style={[styles.rowText, { color: theme.colors.text }]}>Modo Oscuro</Text>
                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: "#767577", true: accentColor }}
                  />
                </View>
              </View>
              <View style={styles.pickerContainer}>
                <ColorPicker color={tempColor} onColorChange={setTempColor} thumbSize={25} sliderSize={25} noSnap={true} row={false} />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: tempColor }]} onPress={saveColor}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL REINICIAR $0 */}
        <Modal animationType="fade" transparent={true} visible={resetModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmContent, { backgroundColor: theme.colors.card }]}>
              <MaterialCommunityIcons name="refresh-circle" size={60} color={accentColor} style={styles.modalIcon} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>¿Reiniciar montos?</Text>
              <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
                Se pondrán todos tus gastos en <Text style={{fontWeight: 'bold'}}>$0</Text>. Las categorías no se borrarán.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setResetModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: accentColor }]} onPress={ejecutarReinicio}>
                  <Text style={styles.saveBtnText}>Reiniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL BORRAR TODO */}
        <Modal animationType="fade" transparent={true} visible={borrarTodoModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmContent, { backgroundColor: theme.colors.card }]}>
              <MaterialCommunityIcons name="alert-octagon" size={60} color="#FF4444" style={styles.modalIcon} />
              <Text style={[styles.modalTitle, { color: '#FF4444' }]}>¿Borrar todo?</Text>
              <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
                Se eliminarán permanentemente <Text style={{fontWeight: 'bold'}}>todos los gastos y categorías</Text> creadas.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setBorrarTodoModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF4444' }]} onPress={ejecutarBorradoTotal}>
                  <Text style={styles.saveBtnText}>Borrar Todo</Text>
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
  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 10, marginTop: 25, textTransform: 'uppercase', opacity: 0.6 },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, elevation: 2 },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', height: 550, padding: 20, borderRadius: 25 },
  confirmContent: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalIcon: { marginBottom: 15 },
  modalDescription: { textAlign: 'center', fontSize: 16, marginBottom: 25, lineHeight: 22 },
  darkModeBox: { borderRadius: 15, padding: 15, marginBottom: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { fontSize: 16, fontWeight: '600' },
  pickerContainer: { flex: 1, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { flex: 0.48, padding: 15, borderRadius: 12, backgroundColor: '#EEE', alignItems: 'center' },
  cancelBtnText: { color: '#333', fontWeight: 'bold' },
  saveBtnText: { color: 'white', fontWeight: 'bold' }
});