import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // O la librería de iconos que uses
import AppHeader from '../components/AppHeader';
import { COLORS } from '../constants/theme';
import { useGastos } from '../hooks/useGastos'; // Asumiendo que aquí tendrás las funciones para borrar

export default function OpcionesScreen() {
  const { limpiarGastos } = useGastos(); // Deberás implementar esto en tu hook

  const handleToggleTheme = () => {
    Alert.alert('Tema', 'Funcionalidad de tema oscuro próximamente.');
  };

  const handleExportData = (tipo) => {
    Alert.alert(
      'Exportar Datos',
      `La exportación en formato ${tipo} por email estará disponible pronto.`
    );
  };

  const confirmarBorrado = (modo) => {
    const mensaje = modo === 'cero' 
      ? "¿Estás seguro de poner todos los montos en $0? Esta acción no se puede deshacer."
      : "¿Estás seguro de eliminar todos los conceptos? Se borrará todo el historial.";

    Alert.alert(
      "Confirmar acción",
      mensaje,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive", 
          onPress: () => {
            // Aquí llamarías a la función de tu hook
            console.log(`Ejecutando: ${modo}`);
            Alert.alert("Éxito", "Operación realizada correctamente.");
          } 
        }
      ]
    );
  };

  const OptionButton = ({ icon, title, subtitle, onPress, color = COLORS.text, isDestructive = false }) => (
    <TouchableOpacity 
      style={styles.optionItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FFE5E5' : COLORS.primaryLight + '44' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={isDestructive ? '#FF4444' : COLORS.primary} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, { color: isDestructive ? '#FF4444' : color }]}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <OptionButton 
          icon="theme-light-dark" 
          title="Cambiar Tema" 
          subtitle="Alternar entre modo claro y oscuro"
          onPress={handleToggleTheme}
        />

        <Text style={styles.sectionTitle}>Datos y Exportación</Text>
        <OptionButton 
          icon="file-pdf-box" 
          title="Exportar como PDF" 
          subtitle="Enviar reporte mensual por email"
          onPress={() => handleExportData('PDF')}
        />
        <OptionButton 
          icon="code-json" 
          title="Exportar como JSON" 
          subtitle="Copia de seguridad de tus datos"
          onPress={() => handleExportData('JSON')}
        />

        <Text style={[styles.sectionTitle, { color: '#FF4444' }]}>Zona de Peligro</Text>
        <View style={styles.dangerZone}>
          <OptionButton 
            icon="restart" 
            title="Reiniciar a $0" 
            subtitle="Mantener categorías pero limpiar montos"
            onPress={() => confirmarBorrado('cero')}
            isDestructive
          />
          <OptionButton 
            icon="trash-can-outline" 
            title="Borrar todo" 
            subtitle="Eliminar todos los registros permanentemente"
            onPress={() => confirmarBorrado('borrar')}
            isDestructive
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 25,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: '#FF444433',
    borderRadius: 20,
    padding: 5,
    backgroundColor: '#FFF5F5',
  }
});