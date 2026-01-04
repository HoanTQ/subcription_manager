import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  AlertCircle, Clock, Calendar, SkipForward, TrendingUp, Filter, ChevronDown, CheckCircle2
} from 'lucide-react';
import Toast from '../components/Toast';
import ServiceIcon from '../components/ServiceIcon';

/**
 * Upcoming page với thiết kế hiện đại
 * Theo dõi các subscription sắp đến hạn thanh toán
 */
const Upcoming = () => {
  const [upcomingData, setUpcomingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [toast, setToast] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const showSuccess = (message) => setToast({ message, type: 'success' });
  const showError = (message) => setToast({ message, type: 'error' });

  useEffect(() => { fetchUpcoming(); }, [selectedDays]);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/upcoming?days=${selectedDays}`);
      if (response.data.success) setUpcomingData(response.data.data);
    } catch (err) {
      showError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveNext = async (subscriptionId) => {
    try {
      setProcessingId(subscriptionId);
      await api.post(`/subscriptions/${subscriptionId}/move-next`);
      await fetchUpcoming();
      showSuccess('Đã chuyển sang kỳ tiếp theo!');
    } catch (err) {
      showError('Không thể chuyển kỳ thanh toán');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  const getDaysInfo = (days) => {
    if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, color: 'text-rose-600', bg: 'bg-rose-50' };
    if (days === 0) return { text: 'Hôm nay', color: 'text-rose-600', bg: 'bg-rose-50' };
    if (days === 1) return { text: 'Ngày mai', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (days <= 3) return { text: `Còn ${days} ngày`, color: 'text-amber-600', bg: 'bg-amber-50' };
    if (days <= 7) return { text: `Còn ${days} ngày`, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: `Còn ${days} ngày`, color: 'text-slate-600', bg: 'bg-slate-50' };
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl shimmer" />)}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Quá hạn', value: upcomingData?.summary?.overdueCount || 0, icon: AlertCircle, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
    { label: 'Sắp đến hạn', value: upcomingData?.summary?.dueSoonCount || 0, icon: Clock, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { label: 'Sau này', value: upcomingData?.summary?.laterCount || 0, icon: Calendar, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { label: 'Tổng tiền', value: formatCurrency(upcomingData?.summary?.totalAmount || 0), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', isAmount: true },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Sắp đến hạn</h1>
          <p className="text-slate-500 mt-1">Theo dõi các subscription cần thanh toán</p>
        </div>
        
        {/* Filter */}
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value={7}>7 ngày tới</option>
              <option value={14}>14 ngày tới</option>
              <option value={30}>30 ngày tới</option>
              <option value={60}>60 ngày tới</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <div key={index} className="card-modern p-4 card-hover cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className={`text-lg font-bold ${card.isAmount ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Section */}
      {upcomingData?.overdue?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-rose-600">Quá hạn ({upcomingData.overdue.length})</h2>
          </div>
          <div className="space-y-3">
            {upcomingData.overdue.map((sub) => (
              <SubscriptionCard key={sub.subscriptionId} subscription={sub} type="overdue" onMoveNext={handleMoveNext} processingId={processingId} formatCurrency={formatCurrency} formatDate={formatDate} getDaysInfo={getDaysInfo} />
            ))}
          </div>
        </div>
      )}

      {/* Due Soon Section */}
      {upcomingData?.dueSoon?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-lg font-semibold text-amber-600">Sắp đến hạn ({upcomingData.dueSoon.length})</h2>
          </div>
          <div className="space-y-3">
            {upcomingData.dueSoon.map((sub) => (
              <SubscriptionCard key={sub.subscriptionId} subscription={sub} type="dueSoon" onMoveNext={handleMoveNext} processingId={processingId} formatCurrency={formatCurrency} formatDate={formatDate} getDaysInfo={getDaysInfo} />
            ))}
          </div>
        </div>
      )}

      {/* Later Section */}
      {upcomingData?.later?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-lg font-semibold text-blue-600">Sau này ({upcomingData.later.length})</h2>
          </div>
          <div className="space-y-3">
            {upcomingData.later.map((sub) => (
              <SubscriptionCard key={sub.subscriptionId} subscription={sub} type="later" onMoveNext={handleMoveNext} processingId={processingId} formatCurrency={formatCurrency} formatDate={formatDate} getDaysInfo={getDaysInfo} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingData && !upcomingData.overdue?.length && !upcomingData.dueSoon?.length && !upcomingData.later?.length && (
        <div className="card-modern p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Tuyệt vời!</h3>
          <p className="text-slate-500">Không có subscription nào sắp đến hạn trong {selectedDays} ngày tới.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Subscription Card Component
 */
const SubscriptionCard = ({ subscription, type, onMoveNext, processingId, formatCurrency, formatDate, getDaysInfo }) => {
  const daysInfo = getDaysInfo(subscription.daysUntilDue);
  const borderColors = { overdue: 'border-l-rose-500', dueSoon: 'border-l-amber-500', later: 'border-l-blue-500' };

  return (
    <div className={`card-modern p-5 border-l-4 ${borderColors[type]} card-hover cursor-pointer`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Service Icon */}
          <ServiceIcon serviceName={subscription.serviceName} size="lg" />
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{subscription.serviceName}</h3>
              {subscription.planName && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{subscription.planName}</span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-1.5 text-sm">
              <span className="text-slate-500">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                {formatDate(subscription.dueDate)}
              </span>
              <span className={`font-medium ${daysInfo.color}`}>
                {daysInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Amount & Action */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
            <p className="text-xs text-slate-500">{subscription.billingCycle}</p>
          </div>
          
          {(type === 'overdue' || type === 'dueSoon') && (
            <button
              onClick={() => onMoveNext(subscription.subscriptionId)}
              disabled={processingId === subscription.subscriptionId}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {processingId === subscription.subscriptionId ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SkipForward className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Đã thanh toán</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upcoming;