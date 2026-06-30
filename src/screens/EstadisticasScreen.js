import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PieChart } from 'react-native-gifted-charts';
import AppHeader from '../components/AppHeader';
import { useGastos } from '../hooks/useGastos';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EstadisticasScreen() {
  const { porCategoria, categorias } = useGastos();
  const { theme, accentColor } = useTheme();

  const mesActual = new Date().toLocaleString('es-UY', { month: 'long' });

  const { chartData, totalCalculado } = useMemo(() => {
      // 1. Obtenemos las entradas del objeto porCategoria
      const entries = Object.entries(porCategoria);

      // 2. CALCULAMOS EL TOTAL REAL
      const total = entries.reduce((acc, [_, monto]) => acc + monto, 0);

      // 3. PROCESAMOS LOS DATOS
      const data = entries
        // AGREGAR ESTA LÍNEA: Filtra las categorías que tienen $0
        .filter(([_, monto]) => monto > 0)
        .map(([nombreCat, monto]) => {
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
    }, [porCategoria, categorias]);

  const pieData = chartData.map(({ value, color, text }) => ({ value, color, text }));

  const handleExportarPDF = async () => {
    try {
      const tituloMes = `${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} ${new Date().getFullYear()}`;

      // Generar las filas con el color de cada categoría para el HTML
      const filasHtml = chartData
        .map(({ categoria, monto, color }) => {
          const porcentaje = totalCalculado > 0 ? ((monto / totalCalculado) * 100).toFixed(1) : '0.0';
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color} !important; margin-right: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                  <span>${categoria}</span>
                </div>
              </td>
              <td style="text-align: right; color: #666;">${porcentaje}%</td>
              <td style="text-align: right; font-weight: 600;">$${monto.toLocaleString('es-UY')}</td>
            </tr>`;
        })
        .join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                padding: 40px;
                color: #333;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                border-bottom: 2px solid ${accentColor};
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              h1 { font-size: 26px; margin: 0; color: #1a1a1a; }
              .subtitle { color: #666; font-size: 16px; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th {
                text-align: left;
                font-size: 12px;
                color: #999;
                text-transform: uppercase;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
              }
              td { padding: 15px 0; border-bottom: 1px solid #f9f9f9; font-size: 15px; }
              .total-box {
                margin-top: 40px;
                padding: 20px;
                background-color: #f8f9fa !important;
                border-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                -webkit-print-color-adjust: exact;
              }
              .total-label { font-size: 16px; font-weight: bold; }
              .total-amount { font-size: 22px; font-weight: 900; color: ${accentColor}; }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #bbb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Reporte de Gastos</h1>
              <div class="subtitle">${tituloMes}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th style="text-align: right;">Distribución</th>
                  <th style="text-align: right;">Monto Gastado</th>
                </tr>
              </thead>
              <tbody>
                ${filasHtml || '<tr><td colspan="3" style="text-align:center; padding: 40px;">No hay registros.</td></tr>'}
              </tbody>
            </table>
            <div class="total-box">
              <span class="total-label">Gasto Total del Mes</span>
              <span class="total-amount">$${totalCalculado.toLocaleString('es-UY')}</span>
            </div>
            <div class="footer">Generado por Money's Gone App</div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // SOLUCIÓN WEB: Crear un iframe oculto para imprimir solo el HTML generado
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const pri = iframe.contentWindow;
        pri.document.open();
        pri.document.write(html);
        pri.document.close();

        setTimeout(() => {
          pri.focus();
          pri.print();
          document.body.removeChild(iframe);
        }, 500);
      } else {
        // SOLUCIÓN MÓVIL: Generar archivo y compartir
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Reporte',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo generar el reporte PDF.');
    }
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
            <MaterialCommunityIcons name="file-pdf-box" size={18} color="white" style={{marginRight: 6}} />
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
          {chartData.map(({ categoria, monto, color }) => {
            const porcentaje = totalCalculado > 0 ? ((monto / totalCalculado) * 100).toFixed(1) : "0.0";
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
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '900' },
  exportBtn: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  exportText: { color: 'white', fontSize: 14, fontWeight: '700' },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
  emptyChart: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed' },
  emptyText: { fontSize: 14, fontWeight: '500' },
  legendContainer: { marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 15, marginBottom: 10, elevation: 1 },
  legendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
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