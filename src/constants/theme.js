export const COLORS = {
  primary: '#3D7A6F',       // verde oscuro (header, botones principales)
  primaryLight: '#8BBDB6',  // verde claro (inputs, nav bar)
  primaryMint: '#C8DDD9',   // verde muy claro (fondo de pantallas con textura)
  white: '#FFFFFF',
  background: '#F5F9F8',
  text: '#1A3330',
  textSecondary: '#5A7A76',
  textMuted: '#8AABA6',
  border: '#1A3330',
  danger: '#E05050',

  // Colores para categorías (igual al gráfico del prototipo)
  categories: {
    Alimentos:       { bg: '#5BB8D4', text: '#1A6A80' },
    Limpieza:        { bg: '#87CEEB', text: '#2E6E8A' },
    'Gastos Comunes':{ bg: '#F0A830', text: '#7A5010' },
    Ocio:            { bg: '#6CB85A', text: '#2A6A1A' },
    Veterinaria:     { bg: '#8B6BB5', text: '#4A2A7A' },
    Transporte:      { bg: '#E07A50', text: '#7A3010' },
    Salud:           { bg: '#E05080', text: '#7A1030' },
    Otro:            { bg: '#A0A0A0', text: '#404040' },
  },
};

export const CATEGORY_LIST = [
  'Alimentos',
  'Limpieza',
  'Gastos Comunes',
  'Ocio',
  'Veterinaria',
  'Transporte',
  'Salud',
  'Otro',
];

export const FONTS = {
  regular: { fontWeight: '400' },
  medium:  { fontWeight: '500' },
  bold:    { fontWeight: '700' },
  heavy:   { fontWeight: '900' },
};
