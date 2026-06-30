import { useCallback, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const VERSION_EXPORT = 1;

const STORAGE_KEY_GASTOS = '@gastos_app:gastos';
const STORAGE_KEY_CATEGORIAS = '@gastos_app:categorias';

const CATEGORIAS_INICIALES = [
  { id: '1', nombre: 'Comida',      color: '#FF9800' },
  { id: '2', nombre: 'Transporte',  color: '#007AFF' },
  { id: '3', nombre: 'Salud',       color: '#4CAF50' },
];

let gastosEnMemoria = [];
let categoriasEnMemoria = [...CATEGORIAS_INICIALES];

const listeners = new Set();

let estadoGlobal = {
  gastos: gastosEnMemoria,
  categorias: categoriasEnMemoria,
  cargando: true,
};

function obtenerDatos() {
  return estadoGlobal;
}

function emitirCambio(cargando = false) {
  estadoGlobal = {
    gastos: gastosEnMemoria,
    categorias: categoriasEnMemoria,
    cargando,
  };
  listeners.forEach((l) => l());
}

function suscribirse(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function persistirDatos() {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_GASTOS,     JSON.stringify(gastosEnMemoria)],
      [STORAGE_KEY_CATEGORIAS, JSON.stringify(categoriasEnMemoria)],
    ]);
  } catch (e) {
    console.error('[useGastos] Error al guardar datos:', e);
  }
}

async function cargarDatos() {
  try {
    const resultado = await AsyncStorage.multiGet([
      STORAGE_KEY_GASTOS,
      STORAGE_KEY_CATEGORIAS,
    ]);
    if (resultado[0][1] !== null) gastosEnMemoria = JSON.parse(resultado[0][1]);
    if (resultado[1][1] !== null) categoriasEnMemoria = JSON.parse(resultado[1][1]);
  } catch (e) {
    console.error('[useGastos] Error al cargar:', e);
  } finally {
    emitirCambio(false);
  }
}

cargarDatos();

export function useGastos() {
  const { gastos, categorias, cargando } = useSyncExternalStore(suscribirse, obtenerDatos, obtenerDatos);

  const agregarGasto = useCallback(async (gasto) => {
    const nuevo = { ...gasto, id: Date.now().toString(), fecha: new Date().toISOString() };
    gastosEnMemoria = [nuevo, ...gastosEnMemoria];
    emitirCambio();
    await persistirDatos();
  }, []);

  const eliminarGasto = useCallback(async (id) => {
    gastosEnMemoria = gastosEnMemoria.filter((g) => g.id !== id);
    emitirCambio();
    await persistirDatos();
  }, []);

  const agregarCategoria = useCallback(async (cat) => {
    const nueva = { ...cat, id: Date.now().toString() };
    categoriasEnMemoria = [...categoriasEnMemoria, nueva];
    emitirCambio();
    await persistirDatos();
  }, []);

  const editarCategoria = useCallback(async (id, datos) => {
    categoriasEnMemoria = categoriasEnMemoria.map(c => c.id === id ? { ...c, ...datos } : c);
    emitirCambio();
    await persistirDatos();
  }, []);

  const eliminarCategoria = useCallback(async (id) => {
    categoriasEnMemoria = categoriasEnMemoria.filter(c => c.id !== id);
    emitirCambio();
    await persistirDatos();
  }, []);

  // --- EXPORTAR (WEB + MÓVIL) ---
  const exportarDatos = useCallback(async () => {
    try {
      const payload = {
        app: 'gastos_app',
        version: VERSION_EXPORT,
        exportadoEn: new Date().toISOString(),
        categorias: categoriasEnMemoria,
        gastos: gastosEnMemoria,
      };
      const json = JSON.stringify(payload, null, 2);
      const nombreArchivo = `gastos_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        URL.revokeObjectURL(url);
        return { ok: true, totalGastos: gastosEnMemoria.length };
      }

      const ruta = FileSystem.documentDirectory + nombreArchivo;
      await FileSystem.writeAsStringAsync(ruta, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(ruta);
      return { ok: true, totalGastos: gastosEnMemoria.length };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  // --- IMPORTAR (WEB + MÓVIL) ---
  const importarDatos = useCallback(async ({ modo = 'reemplazar' } = {}) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true // Importante para estabilidad
      });

      if (res.canceled || !res.assets) return { ok: false, cancelado: true };

      const uri = res.assets[0].uri;
      let contenido;

      if (Platform.OS === 'web') {
        // En Web, la URI es un blob local, fetch es la forma más segura de leerlo
        const response = await fetch(uri);
        contenido = await response.text();
      } else {
        contenido = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const datos = JSON.parse(contenido);

      // Validación básica de estructura
      if (!datos.gastos || !datos.categorias) {
        throw new Error('El archivo no tiene el formato correcto de Money\'s Gone.');
      }

      if (modo === 'combinar') {
        const idsExistentes = new Set(gastosEnMemoria.map(g => g.id));
        const nuevosGastos = datos.gastos.filter(g => !idsExistentes.has(g.id));
        gastosEnMemoria = [...nuevosGastos, ...gastosEnMemoria];

        const nombresCatExistentes = new Set(categoriasEnMemoria.map(c => c.nombre.toLowerCase()));
        const nuevasCats = datos.categorias.filter(c => !nombresCatExistentes.has(c.nombre.toLowerCase()));
        categoriasEnMemoria = [...categoriasEnMemoria, ...nuevasCats];
      } else {
        // Reemplazo total
        gastosEnMemoria = datos.gastos;
        categoriasEnMemoria = datos.categorias;
      }

      // CRUCIAL: Actualizar estado y persistir
      emitirCambio();
      await persistirDatos();

      return {
        ok: true,
        totalGastos: datos.gastos.length,
        totalCategorias: datos.categorias.length
      };
    } catch (e) {
      console.error('[useGastos] Error importando:', e);
      return { ok: false, error: e.message };
    }
  }, [gastos, categorias]);

  const limpiarGastos = useCallback(async () => {
    gastosEnMemoria = gastosEnMemoria.map(g => ({ ...g, monto: 0 }));
    emitirCambio();
    await persistirDatos();
  }, []);

  const eliminarTodo = useCallback(async () => {
    gastosEnMemoria = [];
    categoriasEnMemoria = [...CATEGORIAS_INICIALES];
    emitirCambio();
    await persistirDatos();
  }, []);

  const gastosDelMes = gastos.filter(g => {
    const d = new Date(g.fecha);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  return {
    gastos, categorias, cargando, totalMes: gastosDelMes.reduce((s, g) => s + g.monto, 0),
    gastosDelMes, porCategoria: gastosDelMes.reduce((a, g) => { a[g.categoria] = (a[g.categoria] || 0) + g.monto; return a; }, {}),
    agregarGasto, eliminarGasto, agregarCategoria, editarCategoria, eliminarCategoria,
    limpiarGastos, eliminarTodo, exportarDatos, importarDatos
  };
}