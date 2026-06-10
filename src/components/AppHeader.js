import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

export default function AppHeader({ title = 'Moneys Gone😞' }) {
  return (
    <>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
