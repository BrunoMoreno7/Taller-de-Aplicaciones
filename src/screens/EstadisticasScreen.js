import React from 'react';
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


const pieStyles = StyleSheet.create({
  emptyChart: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryLight + '33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function EstadisticasScreen() {
  const { porCategoria, totalMes } = useGastos();

  const mesActual = new Date().toLocaleString('es-UY', { month: 'long' });

  const categoriaColors = COLORS.categories;

  const chartData = Object.entries(porCategoria)
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


  const pieData = chartData.map(({ value, color, text }) => ({ value, color, text }));

  const handleExportarPDF = () => {
    Alert.alert(
      'Exportar PDF',
      'Funcionalidad de exportación disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de la pantalla */}
        <View style={styles.topRow}>
          <Text style={styles.pageTitle}>
            {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
          </Text>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExportarPDF}
            activeOpacity={0.8}
          >
            <Text style={styles.exportText}>Exportar PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Gráfico */}
        <View style={styles.chartContainer}>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={50}
              showText={false}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: COLORS.text,
                    }}
                  >
                    $
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {totalMes.toLocaleString('es-UY')}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={pieStyles.emptyChart}>
              <Text style={pieStyles.emptyText}>Sin datos este mes</Text>
            </View>
          )}
        </View>

        <View style={styles.legendContainer}>
          {chartData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin estadísticas aún</Text>
              <Text style={styles.emptySubtitle}>
                Registrá gastos para ver el desglose por categoría
              </Text>
            </View>
          ) : (
            chartData.map(({ categoria, monto, color, textColor }) => {
              const porcentaje = ((monto / totalMes) * 100).toFixed(1);
              return (
                <View key={categoria} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text
                    style={[styles.legendCategoria, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {categoria}
                  </Text>
                  <View style={styles.legendRight}>
                    <Text style={styles.legendPorcentaje}>{porcentaje}%</Text>
                    <Text style={[styles.legendMonto, { color: textColor }]}>
                      ${monto.toLocaleString('es-UY')}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Total */}
        {chartData.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total del mes</Text>
            <Text style={styles.totalMonto}>
              ${totalMes.toLocaleString('es-UY')}
            </Text>
          </View>
        )}
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
    paddingBottom: 60,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  exportBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendCategoria: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendPorcentaje: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  legendMonto: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.primaryLight,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  totalMonto: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
