import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Play,
  Pause,
  X,
  SkipForward,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Toast from '../components/Toast';
import ServiceIcon from '../components/ServiceIcon';

/**
 * Subscriptions page với thiết kế hiện đại
 * Quản lý các gói đăng ký định kỳ
 */
const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
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

  // Toast helpers
  const showSuccess = (message) => setToast({ message, type: 'success' });
  const showError = (message) => setToast({ message, type: 'error' });

  // Format helpers
  const formatNumberWithSeparators = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
  };

  const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getCycleText = (cycle, cycleDays) => {
    const cycles = { DAILY: 'Hàng ngày', MONTHLY: 'Hàng tháng', YEARLY: 'Hàng năm', CUSTOM_DAYS: `${cycleDays} ngày` };
    return cycles[cycle] || cycle;
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: { text: 'Hoạt động', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
      PAUSED: { text: 'Tạm dừng', color: 'bg-amber-100 text-amber-700', icon: Pause },
      CANCELLED: { text: 'Đã hủy', color: 'bg-rose-100 text-rose-700', icon: XCircle }
    };
    return configs[status] || { text: status, color: 'bg-slate-100 text-slate-700', icon: AlertCircle };
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [subscriptions, searchTerm, typeFilter, cycleFilter, statusFilter, sortBy, sortOrder]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      if (response.data.success) {
        setSubscriptions(response.data.data.subscriptions);
      }
    } catch (err) {
      showError('Không thể tải danh sách subscription');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...subscriptions];

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.planName && sub.planName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter) filtered = filtered.filter(sub => (sub.subscriptionType || 'RECURRING') === typeFilter);
    if (cycleFilter) filtered = filtered.filter(sub => sub.cycle === cycleFilter);
    if (statusFilter) filtered = filtered.filter(sub => sub.status === statusFilter);

    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        if (sortBy === 'amount') { aVal = a.amountPerCycle; bVal = b.amountPerCycle; }
        else if (sortBy === 'nextDueDate') { aVal = new Date(a.nextDueDate || '9999-12-31'); bVal = new Date(b.nextDueDate || '9999-12-31'); }
        else if (sortBy === 'serviceName') { aVal = a.serviceName.toLowerCase(); bVal = b.serviceName.toLowerCase(); }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredSubscriptions(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, amountPerCycle: parseFormattedNumber(formData.amountPerCycle) };

      if (editingSubscription) {
        const response = await api.put(`/subscriptions/${editingSubscription.subscriptionId}`, submitData);
        if (response.data.success) {
          setTimeout(() => fetchSubscriptions(), 500);
          resetForm();
          showSuccess('Cập nhật subscription thành công!');
        } else {
          showError(response.data.error || 'Cập nhật thất bại');
        }
      } else {
        const response = await api.post('/subscriptions', submitData);
        if (response.data.success) {
          await fetchSubscriptions();
          resetForm();
          showSuccess('Tạo subscription thành công!');
        } else {
          showError(response.data.error || 'Tạo mới thất bại');
        }
      }
    } catch (err) {
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
      const actionText = action === 'pause' ? 'Tạm dừng' : action === 'resume' ? 'Khôi phục' : 'Hủy';
      showSuccess(`${actionText} subscription thành công!`);
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
      serviceName: '', planName: '', subscriptionType: 'RECURRING', cycle: 'MONTHLY',
      cycleDays: '', amountPerCycle: '', currency: 'VND', startDate: '',
      endDate: '', nextDueDate: '', reminderDays: 3, notes: ''
    });
    setEditingSubscription(null);
    setShowModal(false);
  };

  const getActiveFilterCount = () => {
    return [searchTerm, typeFilter, cycleFilter, statusFilter, sortBy].filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-slate-500 mt-1">Quản lý các gói đăng ký định kỳ</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-modern p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm subscription..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-12"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary inline-flex items-center gap-2 ${showFilters ? 'bg-indigo-50 border-indigo-200' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Loại</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-modern">
                <option value="">Tất cả</option>
                <option value="RECURRING">Liên tục</option>
                <option value="FIXED_TERM">Theo kỳ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Chu kỳ</label>
              <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} className="input-modern">
                <option value="">Tất cả</option>
                <option value="DAILY">Hàng ngày</option>
                <option value="MONTHLY">Hàng tháng</option>
                <option value="YEARLY">Hàng năm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-modern">
                <option value="">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="PAUSED">Tạm dừng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sắp xếp</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-modern">
                <option value="">Mặc định</option>
                <option value="serviceName">Tên dịch vụ</option>
                <option value="amount">Số tiền</option>
                <option value="nextDueDate">Ngày thanh toán</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <span>Hiển thị {filteredSubscriptions.length} / {subscriptions.length} subscription</span>
        {getActiveFilterCount() > 0 && (
          <button onClick={() => { setSearchTerm(''); setTypeFilter(''); setCycleFilter(''); setStatusFilter(''); setSortBy(''); }} className="text-indigo-600 hover:text-indigo-700 font-medium">
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSubscriptions.map((sub) => {
            const statusConfig = getStatusConfig(sub.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={sub.subscriptionId} className="card-modern p-4 sm:p-6 card-hover cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ServiceIcon serviceName={sub.serviceName} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{sub.serviceName}</h3>
                      {sub.planName && <p className="text-xs sm:text-sm text-slate-500 truncate">{sub.planName}</p>}
                    </div>
                  </div>
                  <span className={`badge ${statusConfig.color} flex items-center gap-1 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="hidden xs:inline">{statusConfig.text}</span>
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{formatCurrency(sub.amountPerCycle, sub.currency)}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{getCycleText(sub.cycle, sub.cycleDays)}</p>
                </div>

                {/* Info */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                    <span>{sub.subscriptionType === 'FIXED_TERM' ? 'Theo kỳ' : 'Liên tục'}</span>
                  </div>
                  {sub.nextDueDate && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                      <span>Thanh toán: {formatDate(sub.nextDueDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                    <span>Nhắc trước {sub.reminderDays} ngày</span>
                  </div>
                </div>

                {/* Actions - always visible on mobile */}
                <div className="flex items-center gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-slate-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  {sub.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => handleMoveNext(sub.subscriptionId)} className="p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Kỳ tiếp theo">
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(sub.subscriptionId, 'pause')} className="p-1.5 sm:p-2 rounded-lg hover:bg-amber-50 text-amber-600" title="Tạm dừng">
                        <Pause className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {sub.status === 'PAUSED' && (
                    <button onClick={() => handleStatusChange(sub.subscriptionId, 'resume')} className="p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Tiếp tục">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleEdit(sub)} className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Sửa">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sub.subscriptionId)} className="p-1.5 sm:p-2 rounded-lg hover:bg-rose-50 text-rose-600" title="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-modern p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {subscriptions.length === 0 ? 'Chưa có subscription nào' : 'Không tìm thấy kết quả'}
          </h3>
          <p className="text-slate-500 mb-4">
            {subscriptions.length === 0 ? 'Bắt đầu bằng cách thêm subscription đầu tiên' : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
          </p>
          {subscriptions.length === 0 && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Thêm subscription
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingSubscription ? 'Sửa subscription' : 'Thêm subscription mới'}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên dịch vụ *</label>
                  <input type="text" required value={formData.serviceName} onChange={(e) => setFormData({...formData, serviceName: e.target.value})} className="input-modern" placeholder="Netflix, Spotify..." />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên gói</label>
                  <input type="text" value={formData.planName} onChange={(e) => setFormData({...formData, planName: e.target.value})} className="input-modern" placeholder="Premium, Basic..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loại subscription</label>
                  <select value={formData.subscriptionType} onChange={(e) => setFormData({...formData, subscriptionType: e.target.value})} className="input-modern">
                    <option value="RECURRING">Liên tục</option>
                    <option value="FIXED_TERM">Theo kỳ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chu kỳ</label>
                  <select value={formData.cycle} onChange={(e) => setFormData({...formData, cycle: e.target.value})} className="input-modern">
                    <option value="DAILY">Hàng ngày</option>
                    <option value="MONTHLY">Hàng tháng</option>
                    <option value="YEARLY">Hàng năm</option>
                    <option value="CUSTOM_DAYS">Tùy chỉnh</option>
                  </select>
                </div>

                {formData.cycle === 'CUSTOM_DAYS' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số ngày</label>
                    <input type="number" value={formData.cycleDays} onChange={(e) => setFormData({...formData, cycleDays: e.target.value})} className="input-modern" placeholder="30" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền *</label>
                  <input type="text" required value={formData.amountPerCycle} onChange={(e) => setFormData({...formData, amountPerCycle: formatNumberWithSeparators(e.target.value)})} className="input-modern" placeholder="199,000" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tiền tệ</label>
                  <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="input-modern">
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                {formData.subscriptionType === 'RECURRING' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ngày thanh toán tiếp</label>
                    <input type="date" value={formData.nextDueDate} onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})} className="input-modern" />
                  </div>
                )}

                {formData.subscriptionType === 'FIXED_TERM' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu</label>
                      <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="input-modern" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ngày kết thúc</label>
                      <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="input-modern" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nhắc trước (ngày)</label>
                  <input type="number" value={formData.reminderDays} onChange={(e) => setFormData({...formData, reminderDays: parseInt(e.target.value)})} className="input-modern" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input-modern" rows={2} placeholder="Ghi chú thêm..." />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" className="btn-primary flex-1">{editingSubscription ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
