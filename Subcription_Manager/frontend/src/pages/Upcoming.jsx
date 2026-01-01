import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  AlertCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  SkipForwardIcon
} from 'lucide-react';

const Upcoming = () => {
  const [upcomingData, setUpcomingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchUpcoming();
  }, [selectedDays]);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/upcoming?days=${selectedDays}`);
      if (response.data.success) {
        setUpcomingData(response.data.data);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu upcoming');
      console.error('Fetch upcoming error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveNext = async (subscriptionId) => {
    try {
      await api.post(`/subscriptions/${subscriptionId}/move-next`);
      await fetchUpcoming(); // Refresh data
    } catch (err) {
      setError('Không thể chuyển sang kỳ tiếp theo');
    }
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
    if (days < 0) return 'text-red-600';
    if (days <= 1) return 'text-red-500';
    if (days <= 3) return 'text-yellow-600';
    if (days <= 7) return 'text-orange-500';
    return 'text-gray-600';
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
          <h1 className="text-2xl font-bold text-gray-900">Sắp đến hạn</h1>
          <p className="text-gray-600">Theo dõi các subscription sắp đến hạn thanh toán</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Xem trong:</label>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>7 ngày</option>
            <option value={14}>14 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={60}>60 ngày</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {upcomingData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">
                  {upcomingData.summary.overdueCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sắp đến hạn</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {upcomingData.summary.dueSoonCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sau này</p>
                <p className="text-2xl font-bold text-blue-600">
                  {upcomingData.summary.laterCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-6 w-6 text-green-600 font-bold flex items-center justify-center">₫</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng tiền</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(upcomingData.summary.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Section */}
      {upcomingData?.overdue?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-red-600 flex items-center">
              <AlertCircleIcon className="w-5 h-5 mr-2" />
              Quá hạn ({upcomingData.overdue.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingData.overdue.map((subscription) => (
              <div key={subscription.subscriptionId} className="p-6 border-l-4 border-red-500">
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
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Số tiền:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Ngày đến hạn:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(subscription.dueDate)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <p className={`font-medium ${getDaysColor(subscription.daysUntilDue)}`}>
                          {getDaysText(subscription.daysUntilDue)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMoveNext(subscription.subscriptionId)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                      title="Chuyển sang kỳ tiếp theo"
                    >
                      <SkipForwardIcon className="w-4 h-4 mr-1" />
                      Đã thanh toán
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon Section */}
      {upcomingData?.dueSoon?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-yellow-600 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Sắp đến hạn ({upcomingData.dueSoon.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingData.dueSoon.map((subscription) => (
              <div key={subscription.subscriptionId} className="p-6 border-l-4 border-yellow-500">
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
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Số tiền:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Ngày đến hạn:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(subscription.dueDate)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <p className={`font-medium ${getDaysColor(subscription.daysUntilDue)}`}>
                          {getDaysText(subscription.daysUntilDue)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMoveNext(subscription.subscriptionId)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                      title="Chuyển sang kỳ tiếp theo"
                    >
                      <SkipForwardIcon className="w-4 h-4 mr-1" />
                      Đã thanh toán
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Later Section */}
      {upcomingData?.later?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-600 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Sau này ({upcomingData.later.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingData.later.map((subscription) => (
              <div key={subscription.subscriptionId} className="p-6 border-l-4 border-blue-500">
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
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Số tiền:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Ngày đến hạn:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(subscription.dueDate)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <p className={`font-medium ${getDaysColor(subscription.daysUntilDue)}`}>
                          {getDaysText(subscription.daysUntilDue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingData && 
       !upcomingData.overdue?.length && 
       !upcomingData.dueSoon?.length && 
       !upcomingData.later?.length && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có subscription nào sắp đến hạn
          </h3>
          <p className="text-gray-500">
            Tất cả subscription của bạn đều ổn trong {selectedDays} ngày tới.
          </p>
        </div>
      )}
    </div>
  );
};

export default Upcoming;