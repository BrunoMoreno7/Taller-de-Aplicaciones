import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';

// Pantallas
import HomeScreen from './src/screens/HomeScreen';
import NuevoGastoScreen from './src/screens/NuevoGastoScreen';
import EstadisticasScreen from './src/screens/EstadisticasScreen';
import OpcionesScreen from './src/screens/OpcionesScreen';
import GestionCategoriasScreen from './src/screens/GestionCategoriasScreen';

// Tema y Contexto
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home: '🏠',
    Estadisticas: '📊',
    Opciones: '⚙️',
    GestionCategoriasScreen: '🏷️',
  };

  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '❓'}
    </Text>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="NuevoGasto"
        component={NuevoGastoScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Opciones" component={OpcionesScreen} />
      <Stack.Screen name="GestionCategoriasScreen" component={GestionCategoriasScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { accentColor, theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          // Cuando la barra es de color, los iconos activos suelen ser blancos
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarStyle: {
            backgroundColor: accentColor, // <--- AQUÍ CAMBIA EL COLOR DE LA BARRA INFERIOR
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 80 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarLabel: 'Inicio' }}
        />
        <Tab.Screen
          name="Estadisticas"
          component={EstadisticasScreen}
          options={{ tabBarLabel: 'Estadísticas' }}
        />
        <Tab.Screen
          name="Opciones"
          component={OpcionesScreen}
          options={{ tabBarLabel: 'Ajustes' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}