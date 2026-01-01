import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, upcomingRes] = await Promise.all([
        axios.get('/api/v1/dashboard/summary'),
        axios.get('/api/v1/dashboard/upcoming?days=7')
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }

      if (upcomingRes.data.success) {
        setUpcoming(upcomingRes.data.data);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: logout }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="card-outline" size={24} color="#2563eb" />
            <Text style={styles.summaryNumber}>
              {summary?.summary?.totalActiveSubscriptions || 0}
            </Text>
            <Text style={styles.summaryLabel}>Subscriptions</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="cash-outline" size={24} color="#16a34a" />
            <Text style={styles.summaryNumber}>
              {formatCurrency(summary?.summary?.monthlyTotal || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Tháng này</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="calendar-outline" size={24} color="#d97706" />
            <Text style={styles.summaryNumber}>
              {formatCurrency(summary?.summary?.next30DaysTotal || 0)}
            </Text>
            <Text style={styles.summaryLabel}>30 ngày tới</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#fecaca' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#dc2626" />
            <Text style={styles.summaryNumber}>
              {(upcoming?.dueSoon?.length || 0) + (upcoming?.overdue?.length || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Sắp đến hạn</Text>
          </View>
        </View>
      </View>

      {/* Top Subscriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Subscriptions</Text>
        {summary?.topSubscriptions?.length > 0 ? (
          summary.topSubscriptions.slice(0, 5).map((sub, index) => (
            <View key={index} style={styles.subscriptionItem}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionName}>{sub.serviceName}</Text>
                <Text style={styles.subscriptionCycle}>{sub.cycle}</Text>
              </View>
              <Text style={styles.subscriptionAmount}>
                {formatCurrency(sub.amount, sub.currency)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa có subscription nào</Text>
        )}
      </View>

      {/* Upcoming Dues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sắp đến hạn (7 ngày)</Text>
        
        {upcoming?.overdue?.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Quá hạn</Text>
            {upcoming.overdue.map((sub) => (
              <View key={sub.subscriptionId} style={[styles.upcomingItem, styles.overdueItem]}>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingName}>{sub.serviceName}</Text>
                  <Text style={styles.overdueText}>
                    Quá hạn {Math.abs(sub.daysUntilDue)} ngày
                  </Text>
                </View>
                <Text style={styles.upcomingAmount}>
                  {formatCurrency(sub.amount, sub.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {upcoming?.dueSoon?.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Sắp đến hạn</Text>
            {upcoming.dueSoon.map((sub) => (
              <View key={sub.subscriptionId} style={[styles.upcomingItem, styles.dueSoonItem]}>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingName}>{sub.serviceName}</Text>
                  <Text style={styles.dueSoonText}>
                    Còn {sub.daysUntilDue} ngày
                  </Text>
                </View>
                <Text style={styles.upcomingAmount}>
                  {formatCurrency(sub.amount, sub.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(!upcoming?.overdue?.length && !upcoming?.dueSoon?.length) && (
          <Text style={styles.emptyText}>
            Không có subscription nào sắp đến hạn
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 8,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  subscriptionCycle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  subscriptionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  overdueItem: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  dueSoonItem: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  overdueText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 2,
  },
  dueSoonText: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 2,
  },
  upcomingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});