import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon,
  PlayIcon,
  PauseIcon,
  XIcon,
  SkipForwardIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Toast hook
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    serviceName: '',
    planName: '',
    subscriptionType: 'RECURRING', // RECURRING or FIXED_TERM
    cycle: 'MONTHLY',
    cycleDays: '',
    amountPerCycle: '',
    currency: 'VND',
    startDate: '',
    endDate: '', // For FIXED_TERM subscriptions
    nextDueDate: '',
    reminderDays: 3,
    notes: ''
  });

  // Helper function to format number with thousand separators
  const formatNumberWithSeparators = (value) => {
    if (!value) return '';
    // Remove all non-digit characters except decimal point
    const cleanValue = value.toString().replace(/[^\d.]/g, '');
    // Split by decimal point
    const parts = cleanValue.split('.');
    // Add thousand separators to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Return formatted value (limit to 2 decimal places)
    return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
  };

  // Helper function to parse formatted number back to plain number
  const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Apply filters and search when data changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [subscriptions, searchTerm, typeFilter, cycleFilter, statusFilter, sortBy, sortOrder]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching subscriptions...'); // Debug log
      const response = await api.get('/subscriptions');
      console.log('📋 Fetch response:', response.data); // Debug log
      
      if (response.data.success) {
        const subscriptions = response.data.data.subscriptions;
        console.log(`✅ Loaded ${subscriptions.length} subscriptions`); // Debug log
        
        // Log first few subscriptions to check subscriptionType
        subscriptions.slice(0, 3).forEach((sub, index) => {
          console.log(`Subscription ${index + 1}:`, {
            serviceName: sub.serviceName,
            subscriptionType: sub.subscriptionType,
            cycle: sub.cycle,
            amountPerCycle: sub.amountPerCycle
          });
        });
        
        setSubscriptions(subscriptions);
      }
    } catch (err) {
      showError('Không thể tải danh sách subscription');
      console.error('❌ Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter, search and sort function
  const applyFiltersAndSearch = () => {
    let filtered = [...subscriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.planName && sub.planName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.notes && sub.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(sub => (sub.subscriptionType || 'RECURRING') === typeFilter);
    }

    // Apply cycle filter
    if (cycleFilter) {
      filtered = filtered.filter(sub => sub.cycle === cycleFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'amount':
            aValue = a.amountPerCycle;
            bValue = b.amountPerCycle;
            break;
          case 'nextDueDate':
            aValue = new Date(a.nextDueDate || '9999-12-31');
            bValue = new Date(b.nextDueDate || '9999-12-31');
            break;
          case 'serviceName':
            aValue = a.serviceName.toLowerCase();
            bValue = b.serviceName.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredSubscriptions(filtered);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setCycleFilter('');
    setStatusFilter('');
    setSortBy('');
    setSortOrder('asc');
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (typeFilter) count++;
    if (cycleFilter) count++;
    if (statusFilter) count++;
    if (sortBy) count++;
    return count;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Parse the formatted amount back to plain number for API
      const submitData = {
        ...formData,
        amountPerCycle: parseFormattedNumber(formData.amountPerCycle)
      };

      console.log('Submitting data:', submitData); // Debug log

      if (editingSubscription) {
        console.log('🔄 Updating subscription:', editingSubscription.subscriptionId); // Debug log
        console.log('📤 Submit data:', submitData); // Debug log
        
        const response = await api.put(`/subscriptions/${editingSubscription.subscriptionId}`, submitData);
        console.log('📥 Update response:', response.data); // Debug log
        
        if (response.data.success) {
          console.log('✅ Update successful, refreshing data...'); // Debug log
          
          // Force refresh with a small delay
          setTimeout(async () => {
            console.log('🔄 Force refreshing subscriptions...'); // Debug log
            await fetchSubscriptions();
            console.log('✅ Data refreshed after update'); // Debug log
          }, 500);
          
          resetForm();
          // Show success message
          showSuccess(`Cập nhật subscription thành công!\nLoại mới: ${submitData.subscriptionType === 'RECURRING' ? '🔄 Liên tục' : '📅 Theo kỳ'}`);
        } else {
          showError(response.data.error || 'Cập nhật thất bại');
        }
      } else {
        const response = await api.post('/subscriptions', submitData);
        console.log('Create response:', response.data); // Debug log
        
        if (response.data.success) {
          await fetchSubscriptions();
          resetForm();
          // Show success message
          showSuccess('Tạo subscription thành công!');
        } else {
          showError(response.data.error || 'Tạo mới thất bại');
        }
      }
    } catch (err) {
      console.error('Submit error:', err); // Debug log
      console.error('Error response:', err.response?.data); // Debug log
      showError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      serviceName: subscription.serviceName,
      planName: subscription.planName || '',
      subscriptionType: subscription.subscriptionType || 'RECURRING',
      cycle: subscription.cycle,
      cycleDays: subscription.cycleDays || '',
      amountPerCycle: formatNumberWithSeparators(subscription.amountPerCycle.toString()),
      currency: subscription.currency,
      startDate: subscription.startDate,
      endDate: subscription.endDate || '',
      nextDueDate: subscription.nextDueDate,
      reminderDays: subscription.reminderDays,
      notes: subscription.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (subscriptionId) => {
    if (window.confirm('Bạn có chắc muốn xóa subscription này?')) {
      try {
        await api.delete(`/subscriptions/${subscriptionId}`);
        await fetchSubscriptions();
        showSuccess('Xóa subscription thành công!');
      } catch (err) {
        showError('Không thể xóa subscription');
      }
    }
  };

  const handleStatusChange = async (subscriptionId, action) => {
    try {
      await api.post(`/subscriptions/${subscriptionId}/${action}`);
      await fetchSubscriptions();
      
      // Show success message based on action
      const actionText = action === 'pause' ? 'tạm dừng' : action === 'resume' ? 'khôi phục' : 'hủy';
      showSuccess(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} subscription thành công!`);
    } catch (err) {
      showError(`Không thể ${action} subscription`);
    }
  };

  const handleMoveNext = async (subscriptionId) => {
    try {
      await api.post(`/subscriptions/${subscriptionId}/move-next`);
      await fetchSubscriptions();
      showSuccess('Chuyển sang kỳ tiếp theo thành công!');
    } catch (err) {
      showError('Không thể chuyển sang kỳ tiếp theo');
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      planName: '',
      subscriptionType: 'RECURRING',
      cycle: 'MONTHLY',
      cycleDays: '',
      amountPerCycle: '',
      currency: 'VND',
      startDate: '',
      endDate: '',
      nextDueDate: '',
      reminderDays: 3,
      notes: ''
    });
    setEditingSubscription(null);
    setShowModal(false);
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
      case 'DAILY': return 'Hàng ngày';
      case 'MONTHLY': return 'Hàng tháng';
      case 'YEARLY': return 'Hàng năm';
      case 'CUSTOM_DAYS': return `${cycleDays} ngày`;
      default: return cycle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionTypeText = (type) => {
    switch (type) {
      case 'RECURRING': return 'Liên tục';
      case 'FIXED_TERM': return 'Theo kỳ';
      default: return type;
    }
  };

  const getSortText = (sortField) => {
    switch (sortField) {
      case 'serviceName': return 'Tên dịch vụ';
      case 'amount': return 'Số tiền';
      case 'nextDueDate': return 'Ngày thanh toán';
      default: return sortField;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Quản lý các gói đăng ký định kỳ</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm subscription
        </button>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm subscription..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              showFilters || getActiveFilterCount() > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
            {showFilters ? (
              <ChevronUpIcon className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            )}
          </button>
        </div>
      </div>



      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc nâng cao</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại subscription
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả loại</option>
                <option value="RECURRING">🔄 Liên tục</option>
                <option value="FIXED_TERM">📅 Theo kỳ</option>
              </select>
            </div>

            {/* Cycle Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chu kỳ thanh toán
              </label>
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả chu kỳ</option>
                <option value="DAILY">Hàng ngày</option>
                <option value="MONTHLY">Hàng tháng</option>
                <option value="YEARLY">Hàng năm</option>
                <option value="CUSTOM_DAYS">Tùy chỉnh</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">✅ Hoạt động</option>
                <option value="PAUSED">⏸️ Tạm dừng</option>
                <option value="CANCELLED">❌ Đã hủy</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Không sắp xếp</option>
                  <option value="serviceName">Tên dịch vụ</option>
                  <option value="amount">Số tiền</option>
                  <option value="nextDueDate">Ngày thanh toán</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  disabled={!sortBy}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="asc">↑ Tăng</option>
                  <option value="desc">↓ Giảm</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="text-blue-800">
            <span className="font-medium">
              Hiển thị {filteredSubscriptions.length} / {subscriptions.length} subscription
            </span>
            {searchTerm && <span className="ml-2">• 🔍 "{searchTerm}"</span>}
            {typeFilter && <span className="ml-2">• Loại: {getSubscriptionTypeText(typeFilter)}</span>}
            {cycleFilter && <span className="ml-2">• Chu kỳ: {getCycleText(cycleFilter)}</span>}
            {statusFilter && <span className="ml-2">• Trạng thái: {getStatusText(statusFilter)}</span>}
            {sortBy && <span className="ml-2">• Sắp xếp: {getSortText(sortBy)} ({sortOrder === 'asc' ? '↑' : '↓'})</span>}
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredSubscriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                <button
                  onClick={() => handleSort('serviceName')}
                  className="text-left hover:text-blue-600 flex items-center"
                >
                  Dịch vụ
                  {sortBy === 'serviceName' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                <span>Loại & Chu kỳ</span>
                <button
                  onClick={() => handleSort('amount')}
                  className="text-left hover:text-blue-600 flex items-center"
                >
                  Số tiền
                  {sortBy === 'amount' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleSort('nextDueDate')}
                  className="text-left hover:text-blue-600 flex items-center"
                >
                  Thanh toán tiếp
                  {sortBy === 'nextDueDate' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                <span>Thao tác</span>
              </div>
            </div>

            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.subscriptionId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {subscription.serviceName}
                      </h3>
                      {subscription.planName && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({subscription.planName})
                        </span>
                      )}
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                        {getStatusText(subscription.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loại:</span>
                        <p className="font-medium text-gray-900">
                          {getSubscriptionTypeText(subscription.subscriptionType || 'RECURRING')}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Số tiền:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(subscription.amountPerCycle, subscription.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Chu kỳ:</span>
                        <p className="font-medium text-gray-900">
                          {getCycleText(subscription.cycle, subscription.cycleDays)}
                        </p>
                      </div>
                      
                      {subscription.subscriptionType === 'FIXED_TERM' ? (
                        <div>
                          <span className="text-gray-500">Kết thúc:</span>
                          <p className="font-medium text-gray-900">
                            {subscription.endDate ? formatDate(subscription.endDate) : 'Chưa xác định'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-500">Thanh toán tiếp:</span>
                          <p className="font-medium text-gray-900">
                            {subscription.nextDueDate ? formatDate(subscription.nextDueDate) : 'Chưa xác định'}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-500">Nhắc trước:</span>
                        <p className="font-medium text-gray-900">
                          {subscription.reminderDays} ngày
                        </p>
                      </div>
                    </div>
                    
                    {subscription.notes && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Ghi chú: </span>
                        <span className="text-sm text-gray-900">{subscription.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {subscription.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleMoveNext(subscription.subscriptionId)}
                          className="text-green-600 hover:text-green-800"
                          title="Chuyển sang kỳ tiếp theo"
                        >
                          <SkipForwardIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(subscription.subscriptionId, 'pause')}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Tạm dừng"
                        >
                          <PauseIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {subscription.status === 'PAUSED' && (
                      <button
                        onClick={() => handleStatusChange(subscription.subscriptionId, 'resume')}
                        className="text-green-600 hover:text-green-800"
                        title="Tiếp tục"
                      >
                        <PlayIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    {subscription.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(subscription.subscriptionId, 'cancel')}
                        className="text-red-600 hover:text-red-800"
                        title="Hủy"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Sửa"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(subscription.subscriptionId)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {subscriptions.length === 0 ? 'Chưa có subscription nào' : 'Không tìm thấy subscription phù hợp'}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubscription ? 'Sửa subscription' : 'Thêm subscription mới'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên dịch vụ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serviceName}
                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên gói
                  </label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại đăng ký *
                  </label>
                  <select
                    required
                    value={formData.subscriptionType}
                    onChange={(e) => setFormData({...formData, subscriptionType: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="RECURRING">Liên tục (trả đến khi ngưng)</option>
                    <option value="FIXED_TERM">Theo kỳ (có thời hạn cố định)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.subscriptionType === 'RECURRING' 
                      ? 'Trả tiền hàng ngày/tháng đến khi bạn hủy dịch vụ'
                      : 'Trả tiền cho một khoảng thời gian cố định (VD: 1 năm, 6 tháng)'
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chu kỳ thanh toán *
                    </label>
                    <select
                      required
                      value={formData.cycle}
                      onChange={(e) => setFormData({...formData, cycle: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DAILY">Hàng ngày</option>
                      <option value="MONTHLY">Hàng tháng</option>
                      <option value="YEARLY">Hàng năm</option>
                      <option value="CUSTOM_DAYS">Tùy chỉnh</option>
                    </select>
                  </div>
                  
                  {formData.cycle === 'CUSTOM_DAYS' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số ngày *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.cycleDays}
                        onChange={(e) => setFormData({...formData, cycleDays: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số tiền *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.amountPerCycle}
                      onChange={(e) => {
                        const formattedValue = formatNumberWithSeparators(e.target.value);
                        setFormData({...formData, amountPerCycle: formattedValue});
                      }}
                      placeholder="1,000,000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tiền tệ *
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.subscriptionType === 'RECURRING' ? 'Ngày bắt đầu *' : 'Ngày bắt đầu kỳ *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {formData.subscriptionType === 'FIXED_TERM' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày kết thúc kỳ *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Lần thanh toán tiếp theo
                      </label>
                      <input
                        type="date"
                        value={formData.nextDueDate}
                        onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Để trống để tự động tính từ ngày bắt đầu
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nhắc trước (ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({...formData, reminderDays: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingSubscription ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Subscriptions;