import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const slideFirst = useRef(new Animated.Value(-200)).current;
  const slideSecond = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(slideFirst, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(slideSecond, { toValue: 0, duration: 800, useNativeDriver: true })
      ]),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Text style={styles.ss}>S.S.</Text>
        <Animated.Text style={[styles.name, { transform: [{ translateX: slideFirst }] }]}>Shreyansh</Animated.Text>
        <Animated.Text style={[styles.name, { transform: [{ translateX: slideSecond }] }]}>Sahu</Animated.Text>
        <Animated.Text style={[styles.final, { opacity }]}>SHREYANSH SAHU</Animated.Text>
        <Text style={styles.presented}>Presented by Shreyansh Sahu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ss: { color: '#8B0000', fontSize: 64, fontWeight: '800' },
  name: { color: '#8B0000', fontSize: 28, marginTop: 12 },
  final: { color: '#8B0000', fontSize: 32, fontWeight: '900', textShadowColor: '#400', textShadowRadius: 6, marginTop: 16 },
  presented: { color: '#ccc', fontSize: 12, marginTop: 8 }
});