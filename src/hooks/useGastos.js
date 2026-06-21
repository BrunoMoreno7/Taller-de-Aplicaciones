import { useCallback, useSyncExternalStore } from 'react';

// --- ESTADO GLOBAL FUERA DEL HOOK ---
let gastosEnMemoria = [];
const CATEGORIAS_INICIALES = [
  { id: '1', nombre: 'Comida', color: '#FF9800' },
  { id: '2', nombre: 'Transporte', color: '#007AFF' },
  { id: '3', nombre: 'Salud', color: '#4CAF50' },
];
let categoriasEnMemoria = [...CATEGORIAS_INICIALES];

const listeners = new Set();

// 1. Crea una variable para mantener la referencia única del estado
let estadoGlobal = {
  gastos: gastosEnMemoria,
  categorias: categoriasEnMemoria
};

function obtenerDatos() {
  return estadoGlobal; // Devolvemos siempre la misma caja
}

function emitirCambio() {
  // 2. ACTUALIZAMOS LA CAJA COMPLETA antes de avisar a los componentes
  estadoGlobal = {
    gastos: gastosEnMemoria,
    categorias: categoriasEnMemoria
  };
  listeners.forEach((listener) => listener());
}

// --- FUNCIONES DE SUSCRIPCIÓN ---
function suscribirse(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGastos() {
  // Suscripción al store global
  const { gastos, categorias } = useSyncExternalStore(suscribirse, obtenerDatos, obtenerDatos);

  // --- ACCIONES DE GASTOS ---
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
    return nuevoGasto;
  }, []);

  const eliminarGasto = useCallback(async (id) => {
    gastosEnMemoria = gastosEnMemoria.filter((g) => g.id !== id);
    emitirCambio();
  }, []);

  // --- ACCIONES DE CATEGORÍAS ---
  const agregarCategoria = useCallback(async ({ nombre, color }) => {
    const nueva = {
      id: Date.now().toString(),
      nombre,
      color,
    };
    categoriasEnMemoria = [...categoriasEnMemoria, nueva];
    emitirCambio();
  }, []);

  const eliminarCategoria = useCallback(async (id) => {
    categoriasEnMemoria = categoriasEnMemoria.filter((c) => c.id !== id);
    emitirCambio();
  }, []);

  // --- ACCIONES DE OPCIONES (ZONA DE PELIGRO) ---

  // Opción: Dejar montos en $0
  const limpiarGastos = useCallback(async () => {
    gastosEnMemoria = gastosEnMemoria.map(g => ({ ...g, monto: 0 }));
    emitirCambio();
  }, []);

  // Opción: Borrar todo (Gastos y Categorías)
  const eliminarTodo = useCallback(async () => {
    gastosEnMemoria = [];
    categoriasEnMemoria = [...CATEGORIAS_INICIALES]; // Reset a iniciales o []
    emitirCambio();
  }, []);

  // --- CÁLCULOS DERIVADOS ---
  const gastosDelMes = gastos.filter((g) => {
    const fecha = new Date(g.fecha);
    const ahora = new Date();
    return (
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  });

  const totalMes = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);

  // Desglose por categoría para la gráfica
  const porCategoria = gastosDelMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {});

  return {
    gastos,
    categorias, // <--- Nueva propiedad expuesta
    gastosDelMes,
    totalMes,
    porCategoria,
    agregarGasto,
    eliminarGasto,
    agregarCategoria, // <--- Nueva función expuesta
    eliminarCategoria, // <--- Nueva función expuesta
    limpiarGastos,     // <--- Para la pantalla de Opciones
    eliminarTodo       // <--- Para la pantalla de Opciones
  };
}