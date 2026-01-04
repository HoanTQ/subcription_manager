import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ServiceIcon from '../components/ServiceIcon';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '../theme';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, upcomingRes] = await Promise.all([
        axios.get('/api/v1/dashboard/summary'),
        axios.get('/api/v1/dashboard/upcoming?days=7')
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (upcomingRes.data.success) setUpcoming(upcomingRes.data.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: logout, style: 'destructive' }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard} />
        <View style={styles.loadingCard} />
      </View>
    );
  }

  const stats = [
    { label: 'Subscriptions', value: summary?.summary?.totalActiveSubscriptions || 0, icon: 'card', gradient: gradients.primary },
    { label: 'Tháng này', value: formatCurrency(summary?.summary?.monthlyTotal || 0), icon: 'trending-up', gradient: ['#10b981', '#059669'] },
    { label: '30 ngày tới', value: formatCurrency(summary?.summary?.next30DaysTotal || 0), icon: 'calendar', gradient: ['#f59e0b', '#d97706'] },
    { label: 'Sắp đến hạn', value: (upcoming?.dueSoon?.length || 0) + (upcoming?.overdue?.length || 0), icon: 'alert-circle', gradient: ['#f43f5e', '#e11d48'] },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.userEmail}>{user?.email?.split('@')[0]}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient colors={stat.gradient} style={styles.statIcon}>
                <Ionicons name={stat.icon} size={18} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Top Subscriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Subscriptions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {summary?.topSubscriptions?.length > 0 ? (
            summary.topSubscriptions.slice(0, 5).map((sub, index) => (
              <TouchableOpacity key={index} style={styles.subItem} activeOpacity={0.7}>
                <ServiceIcon serviceName={sub.serviceName} size="md" />
                <View style={styles.subInfo}>
                  <Text style={styles.subName}>{sub.serviceName}</Text>
                  <Text style={styles.subCycle}>{sub.cycle === 'MONTHLY' ? 'Hàng tháng' : sub.cycle === 'YEARLY' ? 'Hàng năm' : sub.cycle}</Text>
                </View>
                <Text style={styles.subAmount}>{formatCurrency(sub.amount, sub.currency)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={40} color={colors.slate[300]} />
              <Text style={styles.emptyText}>Chưa có subscription nào</Text>
            </View>
          )}
        </View>

        {/* Upcoming */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sắp đến hạn</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Upcoming')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {upcoming?.overdue?.map((sub) => (
            <View key={sub.subscriptionId} style={[styles.upcomingItem, styles.overdueItem]}>
              <View style={styles.upcomingDot} />
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingName}>{sub.serviceName}</Text>
                <Text style={styles.overdueText}>Quá hạn {Math.abs(sub.daysUntilDue)} ngày</Text>
              </View>
              <Text style={styles.upcomingAmount}>{formatCurrency(sub.amount, sub.currency)}</Text>
            </View>
          ))}

          {upcoming?.dueSoon?.slice(0, 3).map((sub) => (
            <View key={sub.subscriptionId} style={[styles.upcomingItem, styles.dueSoonItem]}>
              <View style={[styles.upcomingDot, { backgroundColor: colors.amber.main }]} />
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingName}>{sub.serviceName}</Text>
                <Text style={styles.dueSoonText}>Còn {sub.daysUntilDue} ngày</Text>
              </View>
              <Text style={styles.upcomingAmount}>{formatCurrency(sub.amount, sub.currency)}</Text>
            </View>
          ))}

          {(!upcoming?.overdue?.length && !upcoming?.dueSoon?.length) && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={40} color={colors.emerald.main} />
              <Text style={styles.emptyText}>Không có thanh toán sắp tới</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  loadingContainer: { flex: 1, padding: spacing.xl, paddingTop: 120 },
  loadingCard: { height: 100, backgroundColor: colors.slate[200], borderRadius: borderRadius.lg, marginBottom: spacing.lg },
  
  header: { paddingTop: 50, paddingBottom: spacing['2xl'], paddingHorizontal: spacing.xl },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...typography.h3, color: colors.white },
  userEmail: { ...typography.small, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  logoutBtn: { padding: spacing.sm, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.md },

  content: { flex: 1, marginTop: -spacing.lg },
  scrollContent: { paddingHorizontal: spacing.lg },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  statCard: {
    width: '50%',
    padding: spacing.xs,
  },
  statCardInner: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.h4, color: colors.slate[800], marginTop: spacing.xs },
  statLabel: { ...typography.caption, color: colors.slate[500], marginTop: 2 },

  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.slate[800] },
  seeAllText: { ...typography.smallBold, color: colors.primary[600] },

  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  subInfo: { flex: 1, marginLeft: spacing.md },
  subName: { ...typography.bodyBold, color: colors.slate[800] },
  subCycle: { ...typography.caption, color: colors.slate[500], marginTop: 2 },
  subAmount: { ...typography.bodyBold, color: colors.slate[800] },

  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  overdueItem: { backgroundColor: colors.rose.light, borderLeftColor: colors.rose.main },
  dueSoonItem: { backgroundColor: colors.amber.light, borderLeftColor: colors.amber.main },
  upcomingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rose.main, marginRight: spacing.md },
  upcomingInfo: { flex: 1 },
  upcomingName: { ...typography.bodyBold, color: colors.slate[800] },
  overdueText: { ...typography.caption, color: colors.rose.dark, marginTop: 2 },
  dueSoonText: { ...typography.caption, color: colors.amber.dark, marginTop: 2 },
  upcomingAmount: { ...typography.bodyBold, color: colors.slate[800] },

  emptyState: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  emptyText: { ...typography.small, color: colors.slate[400], marginTop: spacing.sm },
});

// Fix statCard to include inner styling
const originalStatCard = styles.statCard;
styles.statCard = {
  ...originalStatCard,
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
  padding: spacing.md,
  margin: spacing.xs,
  width: '47%',
  ...shadows.sm,
};