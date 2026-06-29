import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext'; 

export default function AppHeader() {
  const { accentColor } = useTheme(); 

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: accentColor }}>
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
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});