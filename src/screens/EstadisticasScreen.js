import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PieChart } from 'react-native-gifted-charts';
import AppHeader from '../components/AppHeader';
import { useGastos } from '../hooks/useGastos';
import { useTheme } from '../context/ThemeContext';

export default function EstadisticasScreen() {
  // 1. Obtenemos 'categorias' (dinámicas) del hook
  const { porCategoria, categorias } = useGastos();
  const { theme, accentColor } = useTheme();
  const insets = useSafeAreaInsets();

  const mesActual = new Date().toLocaleString('es-UY', { month: 'long' });

  // 2. Lógica de procesamiento de datos corregida
  const { chartData, totalCalculado } = useMemo(() => {
    const entries = Object.entries(porCategoria);

    // Calculamos el total real basado en lo que hay en porCategoria
    const total = entries.reduce((acc, [_, monto]) => acc + monto, 0);

    const data = entries
      .map(([nombreCat, monto]) => {
        // BUSCAMOS EL COLOR EN LA LISTA DINÁMICA DE CATEGORÍAS
        const encontrada = categorias.find(c => c.nombre === nombreCat);
        const colorFinal = encontrada ? encontrada.color : '#CCC';

        return {
          value: monto,
          color: colorFinal,
          categoria: nombreCat,
          monto,
          text: nombreCat,
        };
      })
      .sort((a, b) => b.monto - a.monto);

    return { chartData: data, totalCalculado: total };
  }, [porCategoria, categorias]); // Agregamos categorias como dependencia

  const pieData = chartData.map(({ value, color, text }) => ({ value, color, text }));

  const handleExportarPDF = async () => {
    try {
      const tituloMes = `${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} ${new Date().getFullYear()}`;

      const filasHtml = chartData
        .map(({ categoria, monto, color }) => {
          const porcentaje = totalCalculado > 0 ? ((monto / totalCalculado) * 100).toFixed(1) : '0.0';
          return `
            <tr>
              <td>
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:8px;"></span>
                ${categoria}
              </td>
              <td style="text-align:right;">${porcentaje}%</td>
              <td style="text-align:right;">$${monto.toLocaleString('es-UY')}</td>
            </tr>`;
        })
        .join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 28px; color: #222; }
              h1 { font-size: 20px; margin-bottom: 2px; }
              .subtitle { color: #888; font-size: 13px; margin-bottom: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
              td { padding: 10px 0; border-bottom: 1px solid #f2f2f2; font-size: 14px; }
              .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; border-bottom: none; padding-top: 14px; }
            </style>
          </head>
          <body>
            <h1>Reporte de Gastos</h1>
            <div class="subtitle">${tituloMes}</div>
            <table>
              <thead>
                <tr><th>Categoría</th><th style="text-align:right;">%</th><th style="text-align:right;">Monto</th></tr>
              </thead>
              <tbody>
                ${filasHtml || '<tr><td colspan="3" style="color:#888;">Sin gastos registrados este mes.</td></tr>'}
                <tr class="total-row"><td>Total</td><td></td><td style="text-align:right;">$${totalCalculado.toLocaleString('es-UY')}</td></tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar reporte de gastos',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF generado', 'No se pudo abrir el diálogo para compartir, pero el archivo se generó correctamente.');
      }
    } catch (e) {
      console.error('[EstadisticasScreen] Error al exportar PDF:', e);
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
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
              // El centro del donut usa el fondo de la app para que no se vea el parche blanco
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
              <Text style={styles.emptySubtitle}>Registrá gastos para ver el desglose</Text>
            </View>
          ) : (
            chartData.map(({ categoria, monto, color }) => {
              // Cálculo de porcentaje dinámico y seguro
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