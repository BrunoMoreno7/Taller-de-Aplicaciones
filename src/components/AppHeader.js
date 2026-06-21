import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importar el hook

export default function AppHeader() {
  const { accentColor } = useTheme(); // Obtener el color elegido

  return (
    <SafeAreaView style={{ backgroundColor: accentColor }}>
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <Text style={styles.title}>Money's Gone 😞</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    // Quitamos el color fijo de aquí para que mande el estilo en línea
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});