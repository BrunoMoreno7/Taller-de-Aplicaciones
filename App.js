import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';

// IMPORTANTE: Si quieres usar MaterialCommunityIcons, debes importarlo:
// import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import NuevoGastoScreen from './src/screens/NuevoGastoScreen';
import EstadisticasScreen from './src/screens/EstadisticasScreen';
import OpcionesScreen from './src/screens/OpcionesScreen';
import { COLORS } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }) {
  // Añadimos "Opciones" aquí para que coincida con el nombre de la ruta
  const icons = {
    Home: '🏠',
    Estadisticas: '📊',
    Opciones: '⚙️', // Icono de engranaje (Emoji)
  };

  return (
    <Text
      style={{
        fontSize: 22,
        opacity: focused ? 1 : 0.5,
      }}
    >
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
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      {/* Mantenemos Opciones aquí también por si quieres navegar desde el Header */}
      <Stack.Screen name="Opciones" component={OpcionesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: COLORS.text,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.primaryLight,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
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
          options={{
            tabBarLabel: 'Ajustes'
            // Quitamos el tabBarIcon de aquí porque ya lo maneja el TabIcon global arriba
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}