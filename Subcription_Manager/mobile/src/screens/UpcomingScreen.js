import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function UpcomingScreen() {
  const [upcomingData, setUpcomingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchUpcoming();
  }, [selectedDays]);

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get(`/api/v1/dashboard/upcoming?days=${selectedDays}`);
      if (response.data.success) {
        setUpcomingData(response.data.data);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu upcoming');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUpcoming();
  };

  const handleMoveNext = async (subscriptionId) => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Đánh dấu đã thanh toán và chuyển sang kỳ tiếp theo?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            try {
              await axios.post(`/api/v1/subscriptions/${subscriptionId}/move-next`);
              fetchUpcoming();
              Alert.alert('Thành công', 'Đã chuyển sang kỳ tiếp theo');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể chuyển sang kỳ tiếp theo');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDaysText = (days) => {
    if (days < 0) {
      return `Quá hạn ${Math.abs(days)} ngày`;
    } else if (days === 0) {
      return 'Hôm nay';
    } else if (days === 1) {
      return 'Ngày mai';
    } else {
      return `Còn ${days} ngày`;
    }
  };

  const getDaysColor = (days) => {
    if (days < 0) return '#ef4444';
    if (days <= 1) return '#f59e0b';
    if (days <= 3) return '#eab308';
    if (days <= 7) return '#f97316';
    return '#64748b';
  };

  const renderSubscription = ({ item }) => (
    <View style={[
      styles.subscriptionCard,
      item.daysUntilDue < 0 ? styles.overdueCard : 
      item.daysUntilDue <= 7 ? styles.dueSoonCard : styles.laterCard
    ]}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {item.planName && (
            <Text style={styles.planName}>({item.planName})</Text>
          )}
          <Text style={[styles.daysText, { color: getDaysColor(item.daysUntilDue) }]}>
            {getDaysText(item.daysUntilDue)}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          <Text style={styles.dueDate}>
            {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => handleMoveNext(item.subscriptionId)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.payButtonText}>Đã thanh toán</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSection = (title, data, icon, color) => {
    if (!data || data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={[styles.sectionTitle, { color }]}>
            {title} ({data.length})
          </Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.subscriptionId}
          scrollEnabled={false}
        />
      </View>
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
    <View style={styles.container}>
      {/* Header with filter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sắp đến hạn</Text>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Xem trong:</Text>
          <TextInput
            style={styles.filterInput}
            value={selectedDays.toString()}
            onChangeText={(text) => setSelectedDays(parseInt(text) || 30)}
            keyboardType="numeric"
            placeholder="30"
          />
          <Text style={styles.filterLabel}>ngày</Text>
        </View>
      </View>

      {/* Summary Cards */}
      {upcomingData && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#fecaca' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
              <Text style={styles.summaryNumber}>{upcomingData.summary.overdueCount}</Text>
              <Text style={styles.summaryLabel}>Quá hạn</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#fed7aa' }]}>
              <Ionicons name="time-outline" size={20} color="#ea580c" />
              <Text style={styles.summaryNumber}>{upcomingData.summary.dueSoonCount}</Text>
              <Text style={styles.summaryLabel}>Sắp đến hạn</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <Text style={styles.summaryNumber}>{upcomingData.summary.laterCount}</Text>
              <Text style={styles.summaryLabel}>Sau này</Text>
            </View>
          </View>
        </View>
      )}

      {/* Subscriptions List */}
      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {renderSection('Quá hạn', upcomingData?.overdue, 'alert-circle-outline', '#ef4444')}
            {renderSection('Sắp đến hạn', upcomingData?.dueSoon, 'time-outline', '#f59e0b')}
            {renderSection('Sau này', upcomingData?.later, 'calendar-outline', '#2563eb')}
          </View>
        }
        ListEmptyComponent={
          !upcomingData?.overdue?.length && 
          !upcomingData?.dueSoon?.length && 
          !upcomingData?.later?.length ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                Không có subscription nào sắp đến hạn trong {selectedDays} ngày tới
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  filterInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 60,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overdueCard: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  dueSoonCard: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  laterCard: {
    borderLeftColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  planName: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dueDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});