import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { COLORS, FONTS } from '../constants/theme';
import { useGastos } from '../hooks/useGastos';

function GastoItem({ item, onEliminar }) {
  const colores = COLORS.categories[item.categoria] || COLORS.categories['Otro'];

  const fecha = new Date(item.fecha);
  const fechaStr = fecha.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
  });

  const confirmarEliminar = () => {
    Alert.alert(
      'Eliminar gasto',
      `¿Seguro que querés eliminar este gasto de $${item.monto.toLocaleString('es-UY')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(item.id) },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.gastoItem}
      onLongPress={confirmarEliminar}
      activeOpacity={0.75}
    >
      <View style={[styles.categoriaTag, { backgroundColor: colores.bg }]}>
        <Text style={[styles.categoriaText, { color: colores.text }]}>
          {item.categoria}
        </Text>
      </View>
      <View style={styles.gastoInfo}>
        {item.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={1}>
            {item.descripcion}
          </Text>
        ) : null}
        <Text style={styles.fechaText}>{fechaStr}</Text>
      </View>
      <Text style={styles.montoText}>
        ${item.monto.toLocaleString('es-UY')}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { gastosDelMes, totalMes, eliminarGasto } = useGastos();

  const mesActual = new Date().toLocaleDateString('es-UY', {
    month: 'long',
    year: 'numeric',
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin gastos este mes</Text>
      <Text style={styles.emptySubtitle}>
        Tocá el botón + para registrar tu primer gasto
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.resumenCard}>
        <Text style={styles.resumenLabel}>
          Total {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
        </Text>
        <Text style={styles.resumenMonto}>
          ${totalMes.toLocaleString('es-UY')}
        </Text>
        <Text style={styles.resumenSub}>
          Gestioná gastos de forma inteligente.
        </Text>
      </View>

      {/* Lista de gastos */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Últimos Gastos</Text>

        <FlatList
          data={gastosDelMes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GastoItem item={item} onEliminar={eliminarGasto} />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            gastosDelMes.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NuevoGasto')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resumenCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resumenLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  resumenMonto: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resumenSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  gastoItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  categoriaTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  categoriaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gastoInfo: {
    flex: 1,
  },
  descripcion: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  fechaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  montoText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
