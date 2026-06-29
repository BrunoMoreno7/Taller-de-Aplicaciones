import { useCallback, useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Claves de AsyncStorage ───────────────────────────────────────────────────
const STORAGE_KEY_GASTOS = '@gastos_app:gastos';
const STORAGE_KEY_CATEGORIAS = '@gastos_app:categorias';

// ─── Categorías por defecto ───────────────────────────────────────────────────
const CATEGORIAS_INICIALES = [
  { id: '1', nombre: 'Comida',      color: '#FF9800' },
  { id: '2', nombre: 'Transporte',  color: '#007AFF' },
  { id: '3', nombre: 'Salud',       color: '#4CAF50' },
];

// ─── Estado global en memoria ─────────────────────────────────────────────────
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

// ─── Persistencia ─────────────────────────────────────────────────────────────

/** Guarda el estado actual en AsyncStorage como JSON */
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

/** Lee los datos guardados y los carga en memoria (solo se llama una vez) */
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

// Arrancamos la carga una sola vez al importar el módulo
cargarDatos();

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGastos() {
  const { gastos, categorias, cargando } = useSyncExternalStore(
    suscribirse,
    obtenerDatos,
    obtenerDatos,
  );

  // ── Gastos ──────────────────────────────────────────────────────────────────

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

  // ── Categorías ──────────────────────────────────────────────────────────────

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

  // ── Opciones / zona de peligro ───────────────────────────────────────────────

  /** Pone todos los montos en $0 (mantiene los registros y categorías) */
  const limpiarGastos = useCallback(async () => {
    gastosEnMemoria = gastosEnMemoria.map((g) => ({ ...g, monto: 0 }));
    emitirCambio();
    await persistirDatos();
  }, []);

  /** Borra todos los gastos y resetea categorías a las iniciales */
  const eliminarTodo = useCallback(async () => {
    gastosEnMemoria = [];
    categoriasEnMemoria = [...CATEGORIAS_INICIALES];
    emitirCambio();
    await persistirDatos();
  }, []);

  // ── Cálculos derivados ───────────────────────────────────────────────────────
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
    cargando,          // ← útil para mostrar un splash/loader mientras lee el JSON
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
  };
}
