import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';

export default function AddSubscriptionScreen({ navigation }) {
  const [formData, setFormData] = useState({
    serviceName: '',
    planName: '',
    cycle: 'MONTHLY',
    cycleDays: '',
    amountPerCycle: '',
    currency: 'VND',
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    reminderDays: '3',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.serviceName || !formData.amountPerCycle || !formData.startDate) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.cycle === 'CUSTOM_DAYS' && !formData.cycleDays) {
      Alert.alert('Lỗi', 'Vui lòng nhập số ngày cho chu kỳ tùy chỉnh');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        amountPerCycle: parseFloat(formData.amountPerCycle),
        reminderDays: parseInt(formData.reminderDays),
        cycleDays: formData.cycleDays ? parseInt(formData.cycleDays) : undefined
      };

      const response = await axios.post('/api/v1/subscriptions', submitData);
      if (response.data.success) {
        Alert.alert('Thành công', 'Đã thêm subscription mới', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || 'Không thể tạo subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên dịch vụ *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Netflix Premium, Spotify..."
              value={formData.serviceName}
              onChangeText={(text) => setFormData({...formData, serviceName: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên gói</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Premium, Family..."
              value={formData.planName}
              onChangeText={(text) => setFormData({...formData, planName: text})}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Chu kỳ *</Text>
              <TextInput
                style={styles.input}
                placeholder="MONTHLY/YEARLY/CUSTOM_DAYS"
                value={formData.cycle}
                onChangeText={(text) => setFormData({...formData, cycle: text})}
              />
            </View>

            {formData.cycle === 'CUSTOM_DAYS' && (
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Số ngày *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  value={formData.cycleDays}
                  onChangeText={(text) => setFormData({...formData, cycleDays: text})}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
              <Text style={styles.label}>Số tiền *</Text>
              <TextInput
                style={styles.input}
                placeholder="180000"
                value={formData.amountPerCycle}
                onChangeText={(text) => setFormData({...formData, amountPerCycle: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Tiền tệ *</Text>
              <TextInput
                style={styles.input}
                placeholder="VND/USD/EUR"
                value={formData.currency}
                onChangeText={(text) => setFormData({...formData, currency: text})}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ngày bắt đầu *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onChangeText={(text) => setFormData({...formData, startDate: text})}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Ngày đến hạn</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (tự động)"
                value={formData.nextDueDate}
                onChangeText={(text) => setFormData({...formData, nextDueDate: text})}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nhắc trước (ngày)</Text>
            <TextInput
              style={styles.input}
              placeholder="3"
              value={formData.reminderDays}
              onChangeText={(text) => setFormData({...formData, reminderDays: text})}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú thêm về subscription..."
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang thêm...' : 'Thêm subscription'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});