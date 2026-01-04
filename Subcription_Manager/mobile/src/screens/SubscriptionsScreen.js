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
import axios from 'axios';
import ServiceIcon from '../components/ServiceIcon';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '../theme';

export default function SubscriptionsScreen({ navigation }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/v1/subscriptions');
      if (response.data.success) setSubscriptions(response.data.data.subscriptions);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchSubscriptions(); };

  const formatCurrency = (amount, currency = 'VND') => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  const getCycleText = (cycle, cycleDays) => {
    const map = { MONTHLY: 'Hàng tháng', YEARLY: 'Hàng năm', DAILY: 'Hàng ngày' };
    return map[cycle] || (cycle === 'CUSTOM_DAYS' ? `${cycleDays} ngày` : cycle);
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: { color: colors.emerald.main, bg: colors.emerald.light, text: 'Hoạt động', icon: 'checkmark-circle' },
      PAUSED: { color: colors.amber.main, bg: colors.amber.light, text: 'Tạm dừng', icon: 'pause-circle' },
      CANCELLED: { color: colors.rose.main, bg: colors.rose.light, text: 'Đã hủy', icon: 'close-circle' },
    };
    return configs[status] || configs.ACTIVE;
  };

  const handleAction = async (id, action, confirmMsg) => {
    Alert.alert('Xác nhận', confirmMsg, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xác nhận', onPress: async () => {
        try {
          await axios.post(`/api/v1/subscriptions/${id}/${action}`);
          fetchSubscriptions();
        } catch (err) {
          Alert.alert('Lỗi', 'Thao tác thất bại');
        }
      }}
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Xóa subscription', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`/api/v1/subscriptions/${id}`);
          fetchSubscriptions();
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể xóa');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => {
    const status = getStatusConfig(item.status);
    
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <ServiceIcon serviceName={item.serviceName} size="lg" />
          <View style={styles.cardInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            {item.planName && <Text style={styles.planName}>{item.planName}</Text>}
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.badgeText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.amount}>{formatCurrency(item.amountPerCycle, item.currency)}</Text>
          <Text style={styles.cycle}>{getCycleText(item.cycle, item.cycleDays)}</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.detailText}>Thanh toán: {formatDate(item.nextDueDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="notifications-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.detailText}>Nhắc trước {item.reminderDays} ngày</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {item.status === 'ACTIVE' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.emerald.light }]}
                onPress={() => handleAction(item.subscriptionId, 'move-next', 'Đánh dấu đã thanh toán?')}
              >
                <Ionicons name="checkmark" size={18} color={colors.emerald.main} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.amber.light }]}
                onPress={() => handleAction(item.subscriptionId, 'pause', 'Tạm dừng subscription?')}
              >
                <Ionicons name="pause" size={18} color={colors.amber.main} />
              </TouchableOpacity>
            </>
          )}
          {item.status === 'PAUSED' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.emerald.light }]}
              onPress={() => handleAction(item.subscriptionId, 'resume', 'Tiếp tục subscription?')}
            >
              <Ionicons name="play" size={18} color={colors.emerald.main} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.rose.light }]}
            onPress={() => handleDelete(item.subscriptionId)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.rose.main} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>{subscriptions.length} dịch vụ đang theo dõi</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')} activeOpacity={0.8}>
          <LinearGradient colors={gradients.primary} style={styles.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.subscriptionId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={64} color={colors.slate[300]} />
            <Text style={styles.emptyText}>Chưa có subscription nào</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')}>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  serviceName: { ...typography.bodyBold, color: colors.slate[800] },
  planName: { ...typography.caption, color: colors.slate[500], marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  badgeText: { ...typography.captionBold },

  amountRow: { marginBottom: spacing.md },
  amount: { ...typography.h3, color: colors.slate[800] },
  cycle: { ...typography.small, color: colors.slate[500], marginTop: 2 },

  details: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailText: { ...typography.caption, color: colors.slate[500] },

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