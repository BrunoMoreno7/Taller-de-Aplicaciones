import { useCallback, useSyncExternalStore } from 'react';

let gastosEnMemoria = [];
const listeners = new Set();

function suscribirse(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function obtenerGastos() {
  return gastosEnMemoria;
}

function actualizarGastos(nuevosGastos) {
  gastosEnMemoria = nuevosGastos;
  listeners.forEach((listener) => listener());
}

export function useGastos() {
  const gastos = useSyncExternalStore(suscribirse, obtenerGastos, obtenerGastos);

  const agregarGasto = useCallback(async ({ monto, categoria, descripcion }) => {
    const nuevoGasto = {
      id: Date.now().toString(),
      monto: parseFloat(monto),
      categoria,
      descripcion: descripcion || '',
      fecha: new Date().toISOString(),
    };
    actualizarGastos([nuevoGasto, ...gastosEnMemoria]);
    return nuevoGasto;
  }, []);

  const eliminarGasto = useCallback(async (id) => {
    actualizarGastos(gastosEnMemoria.filter((g) => g.id !== id));
  }, []);

  const gastosDelMes = gastos.filter((g) => {
    const fecha = new Date(g.fecha);
    const ahora = new Date();
    return (
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  });

  const totalMes = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);

  const porCategoria = gastosDelMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {});

  return {
    gastos,
    gastosDelMes,
    totalMes,
    porCategoria,
    agregarGasto,
    eliminarGasto,
  };
}
