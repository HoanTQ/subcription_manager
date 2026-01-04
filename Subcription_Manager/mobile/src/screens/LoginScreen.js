import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert('Đăng nhập thất bại', result.error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={32} color={colors.primary[600]} />
          </View>
          <Text style={styles.logoText}>Subscription</Text>
          <Text style={styles.logoSubtext}>Manager Pro</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcomeText}>Chào mừng trở lại! 👋</Text>
          <Text style={styles.subtitleText}>Đăng nhập để quản lý subscriptions</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.slate[400]} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.slate[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.slate[400]} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={colors.slate[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.slate[400]} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={loading ? [colors.slate[400], colors.slate[500]] : gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {loading ? (
                <Text style={styles.buttonText}>Đang đăng nhập...</Text>
              ) : (
                <>
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Chưa có tài khoản? <Text style={styles.linkTextBold}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  logoText: {
    ...typography.h2,
    color: colors.white,
  },
  logoSubtext: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  welcomeText: {
    ...typography.h3,
    color: colors.slate[800],
    marginBottom: spacing.xs,
  },
  subtitleText: {
    ...typography.body,
    color: colors.slate[500],
    marginBottom: spacing['2xl'],
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.slate[200],
    ...shadows.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.slate[800],
    paddingVertical: spacing.md,
    marginLeft: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.small,
    color: colors.slate[500],
  },
  linkTextBold: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});