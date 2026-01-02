import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import ServiceIcon from '../components/ServiceIcon';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '../theme';

export default function AccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/v1/accounts');
      if (response.data.success) setAccounts(response.data.data.accounts);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchAccounts(); };

  const handleRevealPassword = async (accountId) => {
    if (revealedPasswords[accountId]) {
      setRevealedPasswords(prev => ({ ...prev, [accountId]: null }));
      return;
    }
    try {
      const response = await axios.post(`/api/v1/accounts/${accountId}/reveal-password`);
      if (response.data.success) {
        setRevealedPasswords(prev => ({ ...prev, [accountId]: response.data.data.password }));
        setTimeout(() => setRevealedPasswords(prev => ({ ...prev, [accountId]: null })), 30000);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể hiển thị mật khẩu');
    }
  };

  const copyToClipboard = async (text, id) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (accountId) => {
    Alert.alert('Xóa tài khoản', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`/api/v1/accounts/${accountId}`);
          fetchAccounts();
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể xóa');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <ServiceIcon serviceName={item.serviceName} size="lg" />
        <View style={styles.cardInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {item.url && (
            <Text style={styles.url} numberOfLines={1}>{item.url.replace(/^https?:\/\//, '')}</Text>
          )}
        </View>
      </View>

      {/* Login ID */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Tài khoản</Text>
        <View style={styles.fieldValue}>
          <Text style={styles.fieldText} numberOfLines={1}>{item.loginId}</Text>
          <TouchableOpacity 
            onPress={() => copyToClipboard(item.loginId, `login-${item.accountId}`)}
            style={styles.copyBtn}
          >
            <Ionicons 
              name={copiedId === `login-${item.accountId}` ? 'checkmark' : 'copy-outline'} 
              size={18} 
              color={copiedId === `login-${item.accountId}` ? colors.emerald.main : colors.slate[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Password */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Mật khẩu</Text>
        <View style={styles.fieldValue}>
          <Text style={styles.fieldText}>
            {revealedPasswords[item.accountId] || '••••••••'}
          </Text>
          <TouchableOpacity 
            onPress={() => handleRevealPassword(item.accountId)}
            style={styles.copyBtn}
          >
            <Ionicons 
              name={revealedPasswords[item.accountId] ? 'eye-off-outline' : 'eye-outline'} 
              size={18} 
              color={colors.slate[400]} 
            />
          </TouchableOpacity>
          {revealedPasswords[item.accountId] && (
            <TouchableOpacity 
              onPress={() => copyToClipboard(revealedPasswords[item.accountId], `pass-${item.accountId}`)}
              style={styles.copyBtn}
            >
              <Ionicons 
                name={copiedId === `pass-${item.accountId}` ? 'checkmark' : 'copy-outline'} 
                size={18} 
                color={copiedId === `pass-${item.accountId}` ? colors.emerald.main : colors.slate[400]} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary[50] }]}
          onPress={() => navigation.navigate('AddAccount', { account: item })}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.rose.light }]}
          onPress={() => handleDelete(item.accountId)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.rose.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tài khoản</Text>
          <Text style={styles.subtitle}>{accounts.length} tài khoản đã lưu</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddAccount')} activeOpacity={0.8}>
          <LinearGradient colors={gradients.primary} style={styles.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderItem}
        keyExtractor={(item) => item.accountId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={64} color={colors.slate[300]} />
            <Text style={styles.emptyText}>Chưa có tài khoản nào</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddAccount')}>
              <LinearGradient colors={gradients.primary} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Thêm mới</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  title: { ...typography.h2, color: colors.slate[800] },
  subtitle: { ...typography.small, color: colors.slate[500], marginTop: spacing.xs },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },

  list: { padding: spacing.lg, paddingBottom: 100 },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  serviceName: { ...typography.bodyBold, color: colors.slate[800] },
  url: { ...typography.caption, color: colors.primary[600], marginTop: 2 },

  fieldRow: { marginBottom: spacing.md },
  fieldLabel: { ...typography.captionBold, color: colors.slate[400], textTransform: 'uppercase', marginBottom: spacing.xs },
  fieldValue: { flexDirection: 'row', alignItems: 'center' },
  fieldText: { ...typography.body, color: colors.slate[800], flex: 1, fontFamily: 'monospace' },
  copyBtn: { padding: spacing.sm },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] * 2 },
  emptyText: { ...typography.body, color: colors.slate[400], marginTop: spacing.lg, marginBottom: spacing.xl },
  emptyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyBtnText: { ...typography.bodyBold, color: colors.white },
});