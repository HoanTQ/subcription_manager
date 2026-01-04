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

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    if (!result.success) {
      Alert.alert('Đăng ký thất bại', result.error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="person-add" size={28} color={colors.primary[600]} />
          </View>
          <Text style={styles.logoText}>Tạo tài khoản</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.formContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeText}>Bắt đầu ngay! 🚀</Text>
          <Text style={styles.subtitleText}>Tạo tài khoản để quản lý subscriptions</Text>

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
              />
            </View>
          </View>

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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.slate[400]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.slate[400]} />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.slate[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={loading ? [colors.slate[400], colors.slate[500]] : gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? 'Đang tạo...' : 'Đăng ký'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Đã có tài khoản? <Text style={styles.linkTextBold}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  header: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { position: 'absolute', top: 50, left: 20, padding: spacing.sm },
  logoContainer: { alignItems: 'center' },
  logoIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', ...shadows.lg },
  logoText: { ...typography.h3, color: colors.white, marginTop: spacing.md },
  formContainer: { flex: 1, marginTop: -16 },
  scrollContent: { padding: spacing.xl, paddingTop: spacing['2xl'] },
  welcomeText: { ...typography.h3, color: colors.slate[800], marginBottom: spacing.xs },
  subtitleText: { ...typography.body, color: colors.slate[500], marginBottom: spacing['2xl'] },
  inputWrapper: { marginBottom: spacing.lg },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.slate[200], ...shadows.sm },
  input: { flex: 1, ...typography.body, color: colors.slate[800], paddingVertical: spacing.md, marginLeft: spacing.md },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: borderRadius.lg, marginTop: spacing.lg, gap: spacing.sm, ...shadows.md },
  buttonText: { ...typography.bodyBold, color: colors.white },
  linkButton: { alignItems: 'center', marginTop: spacing['2xl'], paddingVertical: spacing.md },
  linkText: { ...typography.small, color: colors.slate[500] },
  linkTextBold: { color: colors.primary[600], fontWeight: '600' },
});