import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, upcomingRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/upcoming?days=7')
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }

      if (upcomingRes.data.success) {
        setUpcoming(upcomingRes.data.data);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan tài khoản và subscription</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.summary?.totalActiveSubscriptions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tháng này</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.summary?.monthlyTotal || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">30 ngày tới</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.summary?.next30DaysTotal || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sắp đến hạn</p>
              <p className="text-2xl font-bold text-gray-900">
                {(upcoming?.dueSoon?.length || 0) + (upcoming?.overdue?.length || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Subscriptions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Subscriptions
          </h2>
          <div className="space-y-4">
            {summary?.topSubscriptions?.length > 0 ? (
              summary.topSubscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.serviceName}</p>
                    <p className="text-sm text-gray-500">{sub.cycle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(sub.amount, sub.currency)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có subscription nào
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Dues */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sắp đến hạn (7 ngày)
          </h2>
          <div className="space-y-4">
            {upcoming?.overdue?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-600 mb-2">Quá hạn</h3>
                {upcoming.overdue.map((sub) => (
                  <div key={sub.subscriptionId} className="flex items-center justify-between py-2 border-l-4 border-red-500 pl-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{sub.serviceName}</p>
                      <p className="text-sm text-red-600">
                        Quá hạn {Math.abs(sub.daysUntilDue)} ngày
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(sub.amount, sub.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(sub.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcoming?.dueSoon?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-600 mb-2">Sắp đến hạn</h3>
                {upcoming.dueSoon.map((sub) => (
                  <div key={sub.subscriptionId} className="flex items-center justify-between py-2 border-l-4 border-yellow-500 pl-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{sub.serviceName}</p>
                      <p className="text-sm text-yellow-600">
                        Còn {sub.daysUntilDue} ngày
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(sub.amount, sub.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(sub.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!upcoming?.overdue?.length && !upcoming?.dueSoon?.length) && (
              <p className="text-gray-500 text-center py-4">
                Không có subscription nào sắp đến hạn
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;