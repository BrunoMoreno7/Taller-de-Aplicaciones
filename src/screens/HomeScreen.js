import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useGastos } from '../hooks/useGastos';
import { useTheme } from '../context/ThemeContext';

function GastoItem({ item, onEliminar, categorias }) {
  const { theme } = useTheme();

  const colorCat = categorias.find(c => c.nombre === item.categoria)?.color || '#CCC';

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
      style={[styles.gastoItem, { backgroundColor: theme.colors.card }]}
      onLongPress={confirmarEliminar}
      activeOpacity={0.75}
    >
      <View style={[styles.categoriaTag, { backgroundColor: colorCat }]}>
        <Text style={[styles.categoriaText, { color: '#FFFFFF' }]}>
          {item.categoria}
        </Text>
      </View>

      <View style={styles.gastoInfo}>
        {item.descripcion ? (
          <Text style={[styles.descripcion, { color: theme.colors.text }]} numberOfLines={1}>
            {item.descripcion}
          </Text>
        ) : null}
        <Text style={styles.fechaText}>{fechaStr}</Text>
      </View>

      <Text style={[styles.montoText, { color: theme.colors.text }]}>
        ${item.monto.toLocaleString('es-UY')}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { gastosDelMes, totalMes, eliminarGasto, categorias, cargando } = useGastos();
  const { theme, accentColor } = useTheme();

  const mesActual = new Date().toLocaleDateString('es-UY', {
    month: 'long',
    year: 'numeric',
  });

  // Pantalla de carga mientras AsyncStorage devuelve los datos
  if (cargando) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.cargandoText, { color: theme.colors.text }]}>
          Cargando tus gastos…
        </Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin gastos este mes</Text>
      <Text style={styles.emptySubtitle}>
        Tocá el botón + para registrar tu primer gasto
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <View style={[styles.resumenCard, { backgroundColor: accentColor, shadowColor: accentColor }]}>
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

      <View style={styles.listContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Últimos Gastos</Text>

        <FlatList
          data={gastosDelMes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GastoItem
              item={item}
              onEliminar={eliminarGasto}
              categorias={categorias}
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            gastosDelMes.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: accentColor, shadowColor: accentColor }]}
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
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cargandoText: {
    fontSize: 15,
    opacity: 0.6,
  },
  resumenCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
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
    color: '#FFFFFF',
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
    fontWeight: '500',
  },
  fechaText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  montoText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});