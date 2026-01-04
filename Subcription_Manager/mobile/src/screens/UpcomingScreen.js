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
import ServiceIcon from '../components/ServiceIcon';
import { colors, gradients, shadows, spacing, borderRadius, typography } from '../theme';

export default function UpcomingScreen() {
  const [upcomingData, setUpcomingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { fetchUpcoming(); }, [selectedDays]);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/dashboard/upcoming?days=${selectedDays}`);
      if (response.data.success) setUpcomingData(response.data.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchUpcoming(); };

  const handleMoveNext = async (subscriptionId) => {
    setProcessingId(subscriptionId);
    try {
      await axios.post(`/api/v1/subscriptions/${subscriptionId}/move-next`);
      fetchUpcoming();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount, currency = 'VND') =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  const getDaysInfo = (days) => {
    if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, color: colors.rose.main };
    if (days === 0) return { text: 'Hôm nay', color: colors.rose.main };
    if (days === 1) return { text: 'Ngày mai', color: colors.amber.main };
    if (days <= 3) return { text: `Còn ${days} ngày`, color: colors.amber.main };
    return { text: `Còn ${days} ngày`, color: colors.slate[500] };
  };

  const dayOptions = [7, 14, 30, 60];

  const stats = [
    { label: 'Quá hạn', value: upcomingData?.summary?.overdueCount || 0, color: colors.rose.main, bg: colors.rose.light },
    { label: 'Sắp tới', value: upcomingData?.summary?.dueSoonCount || 0, color: colors.amber.main, bg: colors.amber.light },
    { label: 'Sau này', value: upcomingData?.summary?.laterCount || 0, color: colors.cyan.main, bg: colors.cyan.light },
  ];

  const renderSubscription = (sub, type) => {
    const daysInfo = getDaysInfo(sub.daysUntilDue);
    const borderColor = type === 'overdue' ? colors.rose.main : type === 'dueSoon' ? colors.amber.main : colors.cyan.main;
    
    return (
      <View key={sub.subscriptionId} style={[styles.card, { borderLeftColor: borderColor }]}>
        <View style={styles.cardContent}>
          <ServiceIcon serviceName={sub.serviceName} size="md" />
          <View style={styles.cardInfo}>
            <Text style={styles.serviceName}>{sub.serviceName}</Text>
            <View style={styles.cardMeta}>
              <Ionicons name="calendar-outline" size={12} color={colors.slate[400]} />
              <Text style={styles.metaText}>{formatDate(sub.dueDate)}</Text>
              <Text style={[styles.daysText, { color: daysInfo.color }]}>{daysInfo.text}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.amount}>{formatCurrency(sub.amount, sub.currency)}</Text>
            {(type === 'overdue' || type === 'dueSoon') && (
              <TouchableOpacity 
                style={styles.paidBtn}
                onPress={() => handleMoveNext(sub.subscriptionId)}
                disabled={processingId === sub.subscriptionId}
              >
                <LinearGradient colors={['#10b981', '#059669']} style={styles.paidBtnGradient}>
                  {processingId === sub.subscriptionId ? (
                    <Ionicons name="hourglass-outline" size={16} color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard} />
        <View style={styles.loadingCard} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sắp đến hạn</Text>
        <Text style={styles.subtitle}>Theo dõi thanh toán sắp tới</Text>
      </View>

      {/* Day Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {dayOptions.map((days) => (
            <TouchableOpacity
              key={days}
              onPress={() => setSelectedDays(days)}
              style={[styles.filterBtn, selectedDays === days && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, selectedDays === days && styles.filterTextActive]}>
                {days} ngày
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Overdue */}
        {upcomingData?.overdue?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: colors.rose.main }]} />
              <Text style={[styles.sectionTitle, { color: colors.rose.main }]}>Quá hạn ({upcomingData.overdue.length})</Text>
            </View>
            {upcomingData.overdue.map((sub) => renderSubscription(sub, 'overdue'))}
          </View>
        )}

        {/* Due Soon */}
        {upcomingData?.dueSoon?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: colors.amber.main }]} />
              <Text style={[styles.sectionTitle, { color: colors.amber.main }]}>Sắp đến hạn ({upcomingData.dueSoon.length})</Text>
            </View>
            {upcomingData.dueSoon.map((sub) => renderSubscription(sub, 'dueSoon'))}
          </View>
        )}

        {/* Later */}
        {upcomingData?.later?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: colors.cyan.main }]} />
              <Text style={[styles.sectionTitle, { color: colors.cyan.main }]}>Sau này ({upcomingData.later.length})</Text>
            </View>
            {upcomingData.later.map((sub) => renderSubscription(sub, 'later'))}
          </View>
        )}

        {/* Empty */}
        {!upcomingData?.overdue?.length && !upcomingData?.dueSoon?.length && !upcomingData?.later?.length && (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={64} color={colors.emerald.main} />
            <Text style={styles.emptyTitle}>Tuyệt vời!</Text>
            <Text style={styles.emptyText}>Không có thanh toán nào trong {selectedDays} ngày tới</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate[50] },
  loadingContainer: { flex: 1, padding: spacing.xl, paddingTop: 120 },
  loadingCard: { height: 80, backgroundColor: colors.slate[200], borderRadius: borderRadius.lg, marginBottom: spacing.md },

  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  title: { ...typography.h2, color: colors.slate[800] },
  subtitle: { ...typography.small, color: colors.slate[500], marginTop: spacing.xs },

  filterContainer: { backgroundColor: colors.white, paddingBottom: spacing.md, ...shadows.sm },
  filterScroll: { paddingHorizontal: spacing.lg },
  filterBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.slate[100],
    marginRight: spacing.sm,
  },
  filterBtnActive: { backgroundColor: colors.primary[600] },
  filterText: { ...typography.smallBold, color: colors.slate[600] },
  filterTextActive: { color: colors.white },

  content: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: { ...typography.h3 },
  statLabel: { ...typography.caption, color: colors.slate[600], marginTop: 2 },

  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  sectionTitle: { ...typography.bodyBold },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    ...shadows.sm,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  serviceName: { ...typography.bodyBold, color: colors.slate[800] },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs },
  metaText: { ...typography.caption, color: colors.slate[500] },
  daysText: { ...typography.captionBold, marginLeft: spacing.sm },
  cardRight: { alignItems: 'flex-end' },
  amount: { ...typography.bodyBold, color: colors.slate[800] },
  paidBtn: { marginTop: spacing.sm },
  paidBtnGradient: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] * 2 },
  emptyTitle: { ...typography.h4, color: colors.slate[800], marginTop: spacing.lg },
  emptyText: { ...typography.small, color: colors.slate[500], marginTop: spacing.xs },
});