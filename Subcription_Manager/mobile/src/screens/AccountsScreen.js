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
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';

export default function AccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/v1/accounts');
      if (response.data.success) {
        setAccounts(response.data.data.accounts);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  const revealPassword = async (accountId) => {
    try {
      const response = await axios.post(`/api/v1/accounts/${accountId}/reveal-password`);
      if (response.data.success) {
        setRevealedPasswords(prev => ({
          ...prev,
          [accountId]: response.data.data.password
        }));
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể hiển thị mật khẩu');
    }
  };

  const hidePassword = (accountId) => {
    setRevealedPasswords(prev => {
      const newState = { ...prev };
      delete newState[accountId];
      return newState;
    });
  };

  const copyToClipboard = async (text, type) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Thành công', `Đã copy ${type} vào clipboard`);
  };

  const deleteAccount = (accountId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/api/v1/accounts/${accountId}`);
              fetchAccounts();
              Alert.alert('Thành công', 'Đã xóa tài khoản');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa tài khoản');
            }
          }
        }
      ]
    );
  };

  const filteredAccounts = accounts.filter(account =>
    account.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAccount = ({ item }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <TouchableOpacity
          onPress={() => deleteAccount(item.accountId)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.accountDetail}>
        <Text style={styles.detailLabel}>Login ID:</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{item.loginId}</Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(item.loginId, 'Login ID')}
            style={styles.copyButton}
          >
            <Ionicons name="copy-outline" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.accountDetail}>
        <Text style={styles.detailLabel}>Password:</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>
            {revealedPasswords[item.accountId] || '••••••••'}
          </Text>
          <View style={styles.passwordActions}>
            {revealedPasswords[item.accountId] && (
              <TouchableOpacity
                onPress={() => copyToClipboard(revealedPasswords[item.accountId], 'Password')}
                style={styles.copyButton}
              >
                <Ionicons name="copy-outline" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => 
                revealedPasswords[item.accountId] 
                  ? hidePassword(item.accountId)
                  : revealPassword(item.accountId)
              }
              style={styles.eyeButton}
            >
              <Ionicons 
                name={revealedPasswords[item.accountId] ? "eye-off-outline" : "eye-outline"} 
                size={16} 
                color="#64748b" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {item.url && (
        <View style={styles.accountDetail}>
          <Text style={styles.detailLabel}>URL:</Text>
          <Text style={styles.detailValue}>{item.url}</Text>
        </View>
      )}

      {item.notes && (
        <View style={styles.accountDetail}>
          <Text style={styles.detailLabel}>Ghi chú:</Text>
          <Text style={styles.detailValue}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAccount')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm tài khoản</Text>
      </TouchableOpacity>

      {/* Accounts List */}
      <FlatList
        data={filteredAccounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.accountId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {searchTerm ? 'Không tìm thấy tài khoản nào' : 'Chưa có tài khoản nào'}
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    marginBottom: 16,
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
  accountCard: {
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
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  accountDetail: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    fontFamily: 'monospace',
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    padding: 8,
    marginLeft: 4,
  },
  eyeButton: {
    padding: 8,
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
  },
});