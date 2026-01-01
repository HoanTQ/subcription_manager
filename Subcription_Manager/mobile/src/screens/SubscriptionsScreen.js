import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function SubscriptionsScreen({ navigation }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/v1/subscriptions');
      if (response.data.success) {
        setSubscriptions(response.data.data.subscriptions);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách subscription');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
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

  const getCycleText = (cycle, cycleDays) => {
    switch (cycle) {
      case 'MONTHLY': return 'Hàng tháng';
      case 'YEARLY': return 'Hàng năm';
      case 'CUSTOM_DAYS': return `${cycleDays} ngày`;
      default: return cycle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#16a34a';
      case 'PAUSED': return '#d97706';
      case 'CANCELLED': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'PAUSED': return 'Tạm dừng';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const handleStatusChange = async (subscriptionId, action) => {
    try {
      await axios.post(`/api/v1/subscriptions/${subscriptionId}/${action}`);
      fetchSubscriptions();
      Alert.alert('Thành công', `Đã ${action} subscription`);
    } catch (err) {
      Alert.alert('Lỗi', `Không thể ${action} subscription`);
    }
  };

  const handleMoveNext = async (subscriptionId) => {
    Alert.alert(
      'Xác nhận',
      'Chuyển sang kỳ thanh toán tiếp theo?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            try {
              await axios.post(`/api/v1/subscriptions/${subscriptionId}/move-next`);
              fetchSubscriptions();
              Alert.alert('Thành công', 'Đã chuyển sang kỳ tiếp theo');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể chuyển sang kỳ tiếp theo');
            }
          }
        }
      ]
    );
  };

  const deleteSubscription = (subscriptionId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa subscription này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/api/v1/subscriptions/${subscriptionId}`);
              fetchSubscriptions();
              Alert.alert('Thành công', 'Đã xóa subscription');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa subscription');
            }
          }
        }
      ]
    );
  };

  const renderSubscription = ({ item }) => (
    <View style={styles.subscriptionCard}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionTitle}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {item.planName && (
            <Text style={styles.planName}>({item.planName})</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.subscriptionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số tiền:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(item.amountPerCycle, item.currency)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Chu kỳ:</Text>
          <Text style={styles.detailValue}>
            {getCycleText(item.cycle, item.cycleDays)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày đến hạn:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.nextDueDate)}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghi chú:</Text>
            <Text style={styles.detailValue}>{item.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'ACTIVE' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.moveNextButton]}
              onPress={() => handleMoveNext(item.subscriptionId)}
            >
              <Ionicons name="play-forward-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Đã thanh toán</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={() => handleStatusChange(item.subscriptionId, 'pause')}
            >
              <Ionicons name="pause-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {item.status === 'PAUSED' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resumeButton]}
            onPress={() => handleStatusChange(item.subscriptionId, 'resume')}
          >
            <Ionicons name="play-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        )}

        {item.status !== 'CANCELLED' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleStatusChange(item.subscriptionId, 'cancel')}
          >
            <Ionicons name="close-outline" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteSubscription(item.subscriptionId)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSubscription')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm subscription</Text>
      </TouchableOpacity>

      {/* Subscriptions List */}
      <FlatList
        data={subscriptions}
        renderItem={renderSubscription}
        keyExtractor={(item) => item.subscriptionId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có subscription nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionTitle: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  planName: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  subscriptionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  moveNextButton: {
    backgroundColor: '#16a34a',
  },
  pauseButton: {
    backgroundColor: '#d97706',
  },
  resumeButton: {
    backgroundColor: '#16a34a',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
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
  },
});