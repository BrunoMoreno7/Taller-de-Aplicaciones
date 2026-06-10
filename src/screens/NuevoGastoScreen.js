import React, { useState } from 'react';
import {
  View,
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
import AppHeader from '../components/AppHeader';
import { COLORS, CATEGORY_LIST } from '../constants/theme';
import { useGastos } from '../hooks/useGastos';

export default function NuevoGastoScreen({ navigation }) {
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const { agregarGasto } = useGastos();

  const handleGuardar = async () => {
    // Validaciones
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

  const coloresCategoria = categoria
    ? COLORS.categories[categoria] || COLORS.categories['Otro']
    : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Nuevo Gasto</Text>

        {/* MONTO */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Monto</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* CATEGORÍA */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              coloresCategoria && { backgroundColor: coloresCategoria.bg },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                coloresCategoria && { color: coloresCategoria.text, fontWeight: '700' },
              ]}
            >
              {categoria || 'Elegir categoría'}
            </Text>
            <Text style={[styles.chevron, coloresCategoria && { color: coloresCategoria.text }]}>
              ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* DESCRIPCIÓN */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Descripción{' '}
            <Text style={styles.opcional}>(Opcional)</Text>
          </Text>
          <TextInput
            style={[styles.inputBase, styles.textArea]}
            placeholder="Ingresar Descripcion"
            placeholderTextColor={COLORS.textMuted}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity
          style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
          onPress={handleGuardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.guardarText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE CATEGORÍAS */}
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
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Elegir categoría</Text>
            <FlatList
              data={CATEGORY_LIST}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const col = COLORS.categories[item] || COLORS.categories['Otro'];
                const seleccionada = item === categoria;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoriaOption,
                      { backgroundColor: col.bg },
                      seleccionada && styles.categoriaSeleccionada,
                    ]}
                    onPress={() => {
                      setCategoria(item);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.categoriaOptionText, { color: col.text }]}>
                      {item}
                    </Text>
                    {seleccionada && (
                      <Text style={[styles.checkmark, { color: col.text }]}>✓</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.text,
    marginBottom: 28,
    letterSpacing: -1,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  opcional: {
    fontWeight: '400',
    color: COLORS.textMuted,
    fontSize: 14,
  },
  inputBase: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 4,
  },
  montoInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    paddingVertical: 12,
  },
  selectButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
  },
  guardarBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  guardarBtnDisabled: {
    opacity: 0.7,
  },
  guardarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  categoriaOption: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoriaSeleccionada: {
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  categoriaOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '900',
  },
});
