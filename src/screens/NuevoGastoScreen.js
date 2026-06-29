import React, { useState } from 'react';
import {  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useGastos } from '../hooks/useGastos';
import { useTheme } from '../context/ThemeContext';

export default function NuevoGastoScreen({ navigation }) {
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const insets = useSafeAreaInsets();

  // 1. Obtenemos las categorías dinámicas del hook
  const { agregarGasto, categorias } = useGastos();
  const { theme, accentColor } = useTheme();

  const handleGuardar = async () => {
    if (!monto.trim()) {
      Alert.alert('Campo requerido', 'Ingresá el monto del gasto.');
      return;
    }
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido mayor a 0.');
      return;
    }
    if (!categoria) {
      Alert.alert('Campo requerido', 'Elegí una categoría para el gasto.');
      return;
    }

    setGuardando(true);
    try {
      await agregarGasto({ monto: montoNum, categoria, descripcion });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el gasto. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // 2. Buscamos el objeto de la categoría seleccionada para obtener su color
  const objetoCategoria = categorias.find(c => c.nombre === categoria);

  const inputThemeStyle = {
    backgroundColor: theme.colors.card,
    borderColor: theme.dark ? '#333' : '#EEE',
    color: theme.colors.text
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Nuevo Gasto</Text>

        {/* MONTO */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Monto</Text>
          <View style={[styles.inputWrapper, inputThemeStyle]}>
            <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
            <TextInput
              style={[styles.montoInput, { color: theme.colors.text }]}
              placeholder="0"
              placeholderTextColor={theme.dark ? '#666' : '#AAA'}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* CATEGORÍA */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Categoría</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              inputThemeStyle,
              // Aplicamos el color de la categoría si está seleccionada
              objetoCategoria && { backgroundColor: objetoCategoria.color, borderColor: objetoCategoria.color },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                { color: theme.dark ? '#AAA' : '#888' },
                objetoCategoria && { color: '#FFF', fontWeight: '700' },
              ]}
            >
              {categoria || 'Elegir categoría'}
            </Text>
            <Text style={[styles.chevron, objetoCategoria && { color: '#FFF' }]}>
              ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* DESCRIPCIÓN */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Descripción <Text style={styles.opcional}>(Opcional)</Text>
          </Text>
          <TextInput
            style={[styles.inputBase, inputThemeStyle, styles.textArea]}
            placeholder="Ingresar Descripcion"
            placeholderTextColor={theme.dark ? '#666' : '#AAA'}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          style={[
            styles.guardarBtn,
            { backgroundColor: accentColor, shadowColor: accentColor },
            guardando && styles.guardarBtnDisabled
          ]}
          onPress={handleGuardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.guardarText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE CATEGORÍAS DINÁMICO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Elegir categoría</Text>
            <FlatList
              data={categorias} // <-- USAMOS LAS CATEGORÍAS DEL HOOK
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const seleccionada = item.nombre === categoria;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoriaOption,
                      { backgroundColor: item.color },
                      seleccionada && { borderWidth: 3, borderColor: theme.colors.text },
                    ]}
                    onPress={() => {
                      setCategoria(item.nombre);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.categoriaOptionText, { color: '#FFF' }]}>
                      {item.nombre}
                    </Text>
                    {seleccionada && (
                      <Text style={[styles.checkmark, { color: '#FFF' }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', marginBottom: 28, letterSpacing: -1 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  opcional: { fontWeight: '400', color: '#888', fontSize: 14 },
  inputBase: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14 },
  currencySymbol: { fontSize: 22, fontWeight: '700', marginRight: 4 },
  montoInput: { flex: 1, fontSize: 28, fontWeight: '800', paddingVertical: 12 },
  selectButton: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 16 },
  chevron: { fontSize: 18 },
  textArea: { height: 90, paddingTop: 12 },
  guardarBtn: { borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginTop: 12, elevation: 3, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  guardarBtnDisabled: { opacity: 0.5 },
  guardarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '70%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#888', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  categoriaOption: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoriaOptionText: { fontSize: 16, fontWeight: '700' },
  checkmark: { fontSize: 18, fontWeight: '900' },
});