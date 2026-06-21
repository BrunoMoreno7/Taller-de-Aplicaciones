import React, { useMemo } from 'react'; // Usamos useMemo para cálculos precisos
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../constants/theme';
import { useGastos } from '../hooks/useGastos';
import { useTheme } from '../context/ThemeContext';

export default function EstadisticasScreen() {
  const { porCategoria, totalMes } = useGastos();
  const { theme, accentColor } = useTheme();

  const mesActual = new Date().toLocaleString('es-UY', { month: 'long' });
  const categoriaColors = COLORS.categories;

  // Calculamos los datos de la gráfica y nos aseguramos de que totalMes sea numérico
  const { chartData, totalCalculado } = useMemo(() => {
    const entries = Object.entries(porCategoria);

    // Calculamos un total local para asegurar precisión en los porcentajes
    const total = entries.reduce((acc, [_, monto]) => acc + monto, 0);

    const data = entries
      .map(([categoria, monto]) => {
        const colorEntry = categoriaColors[categoria] || categoriaColors['Otro'];
        return {
          value: monto,
          color: colorEntry.bg,
          textColor: colorEntry.text ?? colorEntry.bg,
          categoria,
          monto,
          text: categoria,
        };
      })
      .sort((a, b) => b.monto - a.monto);

    return { chartData: data, totalCalculado: total };
  }, [porCategoria]);

  const pieData = chartData.map(({ value, color, text }) => ({ value, color, text }));

  const handleExportarPDF = () => {
    Alert.alert('Exportar PDF', 'Funcionalidad próximamente.', [{ text: 'OK' }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
          </Text>
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: accentColor }]}
            onPress={handleExportarPDF}
          >
            <Text style={styles.exportText}>Exportar PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={50}
              showText={false}
              // CORRECCIÓN MODO OSCURO: El centro del donut ahora usa el fondo de la tarjeta
              innerCircleColor={theme.colors.background}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>$</Text>
                  <Text style={{ fontSize: 14, color: theme.dark ? '#AAA' : '#666' }}>
                    {totalCalculado.toLocaleString('es-UY')}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card, borderColor: accentColor + '66' }]}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>Sin datos</Text>
            </View>
          )}
        </View>

        <View style={styles.legendContainer}>
          {chartData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin estadísticas aún</Text>
            </View>
          ) : (
            chartData.map(({ categoria, monto, color }) => {
              // CORRECCIÓN PORCENTAJES: Uso de totalCalculado para evitar errores de división
              const porcentaje = totalCalculado > 0
                ? ((monto / totalCalculado) * 100).toFixed(1)
                : "0.0";

              return (
                <View key={categoria} style={[styles.legendItem, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={[styles.legendCategoria, { color: theme.colors.text }]} numberOfLines={1}>
                    {categoria}
                  </Text>
                  <View style={styles.legendRight}>
                    <Text style={styles.legendPorcentaje}>{porcentaje}%</Text>
                    <Text style={[styles.legendMonto, { color: theme.colors.text }]}>
                      ${monto.toLocaleString('es-UY')}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {chartData.length > 0 && (
          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={styles.totalLabel}>Total del mes</Text>
            <Text style={[styles.totalMonto, { color: theme.colors.text }]}>
              ${totalCalculado.toLocaleString('es-UY')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: '800' },
  exportBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  exportText: { color: 'white', fontSize: 13, fontWeight: '700' },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
  emptyChart: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed' },
  emptyText: { fontSize: 14, fontWeight: '500' },
  legendContainer: { marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
  legendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendCategoria: { flex: 1, fontSize: 15, fontWeight: '700' },
  legendRight: { alignItems: 'flex-end' },
  legendPorcentaje: { fontSize: 11, color: '#888', fontWeight: '500' },
  legendMonto: { fontSize: 16, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#888' },
  totalMonto: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
});