import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../constants/theme';

// Campo editable con ícono de lápiz
function CampoEditable({ label, value, onChange, secureTextEntry, keyboardType, placeholder }) {
  const [editando, setEditando] = useState(false);
  const [valorTemp, setValorTemp] = useState(value);

  const confirmarEdicion = () => {
    if (!valorTemp.trim()) {
      Alert.alert('Campo vacío', `El campo "${label}" no puede estar vacío.`);
      return;
    }
    onChange(valorTemp);
    setEditando(false);
  };

  const cancelarEdicion = () => {
    setValorTemp(value);
    setEditando(false);
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {editando ? (
          <>
            <TextInput
              style={[styles.input, styles.inputActivo]}
              value={valorTemp}
              onChangeText={setValorTemp}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType || 'default'}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmarEdicion}
            />
            <View style={styles.editBtns}>
              <TouchableOpacity
                style={styles.btnGuardarInline}
                onPress={confirmarEdicion}
                activeOpacity={0.8}
              >
                <Text style={styles.btnGuardarInlineText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancelarInline}
                onPress={cancelarEdicion}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelarInlineText}>✕</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.inputReadonly} numberOfLines={1}>
              {secureTextEntry ? '•'.repeat(value.length || 8) : value || placeholder}
            </Text>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => {
                setValorTemp(value);
                setEditando(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState('Ejemplo');
  const [correo, setCorreo] = useState('ejemplo@mail.com');
  const [contrasena, setContrasena] = useState('12345678');
  const [darkMode, setDarkMode] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const handleGuardarPerfil = () => {
    setGuardandoPerfil(true);
    // Simular guardado
    setTimeout(() => {
      setGuardandoPerfil(false);
      Alert.alert('Perfil guardado', 'Tus datos fueron actualizados correctamente.');
    }, 800);
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sesión cerrada', 'Redirigiendo al login...');
          },
        },
      ]
    );
  };

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
        <Text style={styles.pageTitle}>Mi perfil</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Campos editables */}
        <CampoEditable
          label="Usuario"
          value={usuario}
          onChange={setUsuario}
          placeholder="Tu nombre de usuario"
        />
        <CampoEditable
          label="Correo"
          value={correo}
          onChange={setCorreo}
          keyboardType="email-address"
          placeholder="tu@correo.com"
        />
        <CampoEditable
          label="Contraseña"
          value={contrasena}
          onChange={setContrasena}
          secureTextEntry
          placeholder="Nueva contraseña"
        />

        {/* Dark Mode toggle */}
        <View style={styles.darkModeRow}>
          <View style={styles.darkModeLeft}>
            <Text style={styles.darkModeIcon}>
              {darkMode ? '🌙' : '☀️'}
            </Text>
            <View>
              <Text style={styles.darkModeLabel}>Dark Mode</Text>
              <Text style={styles.darkModeSub}>
                {darkMode ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(v) => {
              setDarkMode(v);
              // En una app real: guardar preferencia y aplicar tema
            }}
            trackColor={{ false: COLORS.primaryLight, true: COLORS.text }}
            thumbColor={darkMode ? COLORS.primary : COLORS.white}
            ios_backgroundColor={COLORS.primaryLight}
          />
        </View>

        {/* Botón guardar cambios */}
        <TouchableOpacity
          style={[styles.guardarBtn, guardandoPerfil && styles.guardarBtnDisabled]}
          onPress={handleGuardarPerfil}
          disabled={guardandoPerfil}
          activeOpacity={0.85}
        >
          <Text style={styles.guardarText}>
            {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={styles.cerrarSesionBtn}
          onPress={handleCerrarSesion}
          activeOpacity={0.7}
        >
          <Text style={styles.cerrarSesionText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 2,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 10,
  },
  inputActivo: {
    color: COLORS.primary,
  },
  inputReadonly: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 10,
  },
  editIcon: {
    paddingLeft: 8,
  },
  editIconText: {
    fontSize: 16,
  },
  editBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  btnGuardarInline: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGuardarInlineText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnCancelarInline: {
    backgroundColor: COLORS.textMuted,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarInlineText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeIcon: {
    fontSize: 24,
  },
  darkModeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  darkModeSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  guardarBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
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
    fontSize: 17,
    fontWeight: '800',
  },
  cerrarSesionBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cerrarSesionText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
