import { useCallback, useEffect, useSyncExternalStore } from 'react';
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
let cargadoDesdeStorage = false;   // flag: la carga inicial ya ocurrió

const listeners = new Set();

let estadoGlobal = {
  gastos: gastosEnMemoria,
  categorias: categoriasEnMemoria,
  cargando: true,                  // mientras no se lee AsyncStorage
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

    const gastosGuardados     = resultado[0][1];
    const categoriasGuardadas = resultado[1][1];

    if (gastosGuardados !== null) {
      gastosEnMemoria = JSON.parse(gastosGuardados);
    }

    if (categoriasGuardadas !== null) {
      categoriasEnMemoria = JSON.parse(categoriasGuardadas);
    }
  } catch (e) {
    console.error('[useGastos] Error al cargar datos:', e);
  } finally {
    cargadoDesdeStorage = true;
    emitirCambio(false); // cargando = false → notifica a todos los componentes
  }
}

cargarDatos();

export function useGastos() {
  const { gastos, categorias, cargando } = useSyncExternalStore(
    suscribirse,
    obtenerDatos,
    obtenerDatos,
  );


  const agregarGasto = useCallback(async ({ monto, categoria, descripcion }) => {
    const nuevoGasto = {
      id: Date.now().toString(),
      monto: parseFloat(monto),
      categoria,
      descripcion: descripcion || '',
      fecha: new Date().toISOString(),
    };
    gastosEnMemoria = [nuevoGasto, ...gastosEnMemoria];
    emitirCambio();
    await persistirDatos();
    return nuevoGasto;
  }, []);

  const eliminarGasto = useCallback(async (id) => {
    gastosEnMemoria = gastosEnMemoria.filter((g) => g.id !== id);
    emitirCambio();
    await persistirDatos();
  }, []);


  const agregarCategoria = useCallback(async ({ nombre, color }) => {
    const nueva = { id: Date.now().toString(), nombre, color };
    categoriasEnMemoria = [...categoriasEnMemoria, nueva];
    emitirCambio();
    await persistirDatos();
  }, []);

  const editarCategoria = useCallback(async (id, nuevosDatos) => {
    categoriasEnMemoria = categoriasEnMemoria.map((c) =>
      c.id === id ? { ...c, ...nuevosDatos } : c,
    );
    emitirCambio();
    await persistirDatos();
  }, []);

  const eliminarCategoria = useCallback(async (id) => {
    categoriasEnMemoria = categoriasEnMemoria.filter((c) => c.id !== id);
    emitirCambio();
    await persistirDatos();
  }, []);

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
      const ruta = FileSystem.documentDirectory + nombreArchivo;

      await FileSystem.writeAsStringAsync(ruta, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(ruta, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar datos de Gastos',
          UTI: 'public.json',
        });
      }

      return { ok: true, ruta, totalGastos: gastosEnMemoria.length };
    } catch (e) {
      console.error('[useGastos] Error al exportar datos:', e);
      return { ok: false, error: e.message };
    }
  }, []);

  const importarDatos = useCallback(async ({ modo = 'reemplazar' } = {}) => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets?.length) {
        return { ok: false, cancelado: true };
      }

      const archivo = resultado.assets[0];
      const contenido = await FileSystem.readAsStringAsync(archivo.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const datos = JSON.parse(contenido);

      const gastosImportados = Array.isArray(datos.gastos) ? datos.gastos : null;
      const categoriasImportadas = Array.isArray(datos.categorias) ? datos.categorias : null;

      if (!gastosImportados || !categoriasImportadas) {
        return { ok: false, error: 'El archivo no tiene el formato esperado.' };
      }

      const gastosValidos = gastosImportados.every(
        (g) =>
          g &&
          typeof g.id !== 'undefined' &&
          typeof g.monto === 'number' &&
          typeof g.categoria !== 'undefined' &&
          typeof g.fecha === 'string',
      );
      const categoriasValidas = categoriasImportadas.every(
        (c) => c && typeof c.id !== 'undefined' && typeof c.nombre === 'string',
      );

      if (!gastosValidos || !categoriasValidas) {
        return { ok: false, error: 'El archivo tiene datos con formato inválido.' };
      }

      if (modo === 'combinar') {
        const idsExistentes = new Set(gastosEnMemoria.map((g) => g.id));
        const nuevosGastos = gastosImportados.filter((g) => !idsExistentes.has(g.id));
        gastosEnMemoria = [...nuevosGastos, ...gastosEnMemoria];

        const idsCatExistentes = new Set(categoriasEnMemoria.map((c) => c.id));
        const nuevasCategorias = categoriasImportadas.filter((c) => !idsCatExistentes.has(c.id));
        categoriasEnMemoria = [...categoriasEnMemoria, ...nuevasCategorias];
      } else {
        gastosEnMemoria = gastosImportados;
        categoriasEnMemoria = categoriasImportadas;
      }

      emitirCambio();
      await persistirDatos();

      return {
        ok: true,
        totalGastos: gastosImportados.length,
        totalCategorias: categoriasImportadas.length,
      };
    } catch (e) {
      console.error('[useGastos] Error al importar datos:', e);
      return { ok: false, error: 'No se pudo leer el archivo. ¿Es un JSON válido exportado desde la app?' };
    }
  }, []);


  const limpiarGastos = useCallback(async () => {
    gastosEnMemoria = gastosEnMemoria.map((g) => ({ ...g, monto: 0 }));
    emitirCambio();
    await persistirDatos();
  }, []);

  const eliminarTodo = useCallback(async () => {
    gastosEnMemoria = [];
    categoriasEnMemoria = [...CATEGORIAS_INICIALES];
    emitirCambio();
    await persistirDatos();
  }, []);

  const gastosDelMes = gastos.filter((g) => {
    const fecha = new Date(g.fecha);
    const ahora = new Date();
    return (
      fecha.getMonth()    === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  });

  const totalMes = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);

  const porCategoria = gastosDelMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {});

  return {
    // Estado
    gastos,
    categorias,
    cargando,
    // Gastos derivados
    gastosDelMes,
    totalMes,
    porCategoria,
    // Acciones de gastos
    agregarGasto,
    eliminarGasto,
    // Acciones de categorías
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    // Acciones de opciones
    limpiarGastos,
    eliminarTodo,
    // Exportar / Importar
    exportarDatos,
    importarDatos,
  };
}