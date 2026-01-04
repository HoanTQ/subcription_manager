import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getServiceConfig, colors, gradients } from '../theme';

/**
 * ServiceIcon - Hiển thị icon cho các dịch vụ subscription
 */
const ServiceIcon = ({ serviceName, size = 'md' }) => {
  const config = getServiceConfig(serviceName);
  
  const sizes = {
    sm: { container: 36, icon: 18, text: 14 },
    md: { container: 44, icon: 20, text: 16 },
    lg: { container: 52, icon: 24, text: 20 },
  };
  
  const s = sizes[size] || sizes.md;
  
  // Nếu có config cho service
  if (config) {
    return (
      <View style={[styles.container, { width: s.container, height: s.container, backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={s.icon} color="#fff" />
      </View>
    );
  }
  
  // Fallback: gradient với chữ cái đầu
  const gradientOptions = [
    gradients.primary,
    ['#10b981', '#059669'],
    ['#f43f5e', '#e11d48'],
    ['#f59e0b', '#d97706'],
    ['#06b6d4', '#0891b2'],
  ];
  const gradientIndex = serviceName ? serviceName.charCodeAt(0) % gradientOptions.length : 0;
  
  return (
    <LinearGradient
      colors={gradientOptions[gradientIndex]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: s.container, height: s.container }]}
    >
      <Text style={[styles.letter, { fontSize: s.text }]}>
        {serviceName?.charAt(0).toUpperCase() || '?'}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ServiceIcon;