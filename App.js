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
import { MaterialCommunityIcons } from '@expo/vector-icons'; // para los íconos

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const OpcionesStack = createNativeStackNavigator(); // Stack adicional para Ajustes

// Iconos de la barra inferior
function TabIcon({ name, focused, color }) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Estadisticas: focused ? 'chart-arc' : 'chart-pie',
    OpcionesTab: focused ? 'cog' : 'cog-outline',
  };

  const iconName = icons[name] || 'help-circle';

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={26}
      color={color}
    />
  );
}

// Stack para la pestaña de Inicio
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="NuevoGasto"
        component={NuevoGastoScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

// Stack para la pestaña de Ajustes (NUEVO)
// Esto permite que GestionCategoriasScreen pertenezca a Ajustes
function OpcionesStackScreen() {
  return (
    <OpcionesStack.Navigator screenOptions={{ headerShown: false }}>
      <OpcionesStack.Screen name="OpcionesMain" component={OpcionesScreen} />
      <OpcionesStack.Screen name="GestionCategoriasScreen" component={GestionCategoriasScreen} />
    </OpcionesStack.Navigator>
  );
}

function AppContent() {
  const { accentColor, theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => ( // Añadimos 'color' aquí
            <TabIcon name={route.name} focused={focused} color={color} /> // Y lo pasamos aquí
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarStyle: {
            backgroundColor: accentColor,
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
          name="OpcionesTab" // Cambiamos el nombre para evitar conflictos con el Stack
          component={OpcionesStackScreen} // Usamos el nuevo Stack de Ajustes
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
