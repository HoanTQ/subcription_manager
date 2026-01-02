import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import ServiceIcon from '../components/ServiceIcon';

/**
 * Dashboard component với thiết kế hiện đại
 * Hiển thị tổng quan subscriptions và upcoming payments
 */
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

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-8 w-48 bg-slate-200 rounded-lg shimmer" />
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl shimmer" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl shimmer" />
          <div className="h-80 bg-white rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary">
          Thử lại
        </button>
      </div>
    );
  }

  const stats = [
    {
      name: 'Tổng Subscriptions',
      value: summary?.summary?.totalActiveSubscriptions || 0,
      icon: CreditCard,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-600',
      change: '+2 tháng này',
      changeType: 'positive'
    },
    {
      name: 'Chi phí tháng này',
      value: formatCurrency(summary?.summary?.monthlyTotal || 0),
      icon: TrendingUp,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      change: 'Ổn định',
      changeType: 'neutral'
    },
    {
      name: '30 ngày tới',
      value: formatCurrency(summary?.summary?.next30DaysTotal || 0),
      icon: Calendar,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      change: 'Dự kiến',
      changeType: 'neutral'
    },
    {
      name: 'Cần thanh toán',
      value: (upcoming?.dueSoon?.length || 0) + (upcoming?.overdue?.length || 0),
      icon: AlertTriangle,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      change: upcoming?.overdue?.length > 0 ? `${upcoming.overdue.length} quá hạn` : 'Tốt',
      changeType: upcoming?.overdue?.length > 0 ? 'negative' : 'positive'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Xin chào! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Đây là tổng quan subscriptions của bạn
          </p>
        </div>
        <Link to="/subscriptions" className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Thêm mới
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name}
              className="stat-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${stat.changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${stat.changeType === 'negative' ? 'bg-rose-100 text-rose-700' : ''}
                    ${stat.changeType === 'neutral' ? 'bg-slate-100 text-slate-600' : ''}
                  `}>
                    {stat.change}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Subscriptions */}
        <div className="card-modern p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Top Subscriptions</h2>
              <p className="text-xs sm:text-sm text-slate-500">Chi phí cao nhất</p>
            </div>
            <Link to="/subscriptions" className="btn-ghost text-xs sm:text-sm inline-flex items-center gap-1">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {summary?.topSubscriptions?.length > 0 ? (
              summary.topSubscriptions.slice(0, 5).map((sub, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                >
                  <ServiceIcon serviceName={sub.serviceName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{sub.serviceName}</p>
                    <p className="text-sm text-slate-500">{sub.cycle === 'MONTHLY' ? 'Hàng tháng' : sub.cycle === 'YEARLY' ? 'Hàng năm' : sub.cycle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(sub.amount, sub.currency)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">Chưa có subscription nào</p>
                <Link to="/subscriptions" className="text-indigo-600 font-medium hover:text-indigo-700 mt-2 inline-block">
                  Thêm ngay →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="card-modern p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Sắp đến hạn</h2>
              <p className="text-xs sm:text-sm text-slate-500">Trong 7 ngày tới</p>
            </div>
            <Link to="/upcoming" className="btn-ghost text-xs sm:text-sm inline-flex items-center gap-1">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {/* Overdue */}
            {upcoming?.overdue?.length > 0 && (
              <div className="space-y-2">
                {upcoming.overdue.map((sub) => (
                  <div 
                    key={sub.subscriptionId}
                    className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-100"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">{sub.serviceName}</p>
                      <p className="text-xs sm:text-sm text-rose-600 font-medium">
                        Quá hạn {Math.abs(sub.daysUntilDue)} ngày
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base">
                        {formatCurrency(sub.amount, sub.currency)}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(sub.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Due Soon */}
            {upcoming?.dueSoon?.length > 0 && (
              <div className="space-y-2">
                {upcoming.dueSoon.slice(0, 4).map((sub) => (
                  <div 
                    key={sub.subscriptionId}
                    className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">{sub.serviceName}</p>
                      <p className="text-xs sm:text-sm text-amber-600">
                        Còn {sub.daysUntilDue} ngày
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base">
                        {formatCurrency(sub.amount, sub.currency)}
                      </p>
                      <p className="text-xs text-slate-500 hidden sm:block">{formatDate(sub.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!upcoming?.overdue?.length && !upcoming?.dueSoon?.length) && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                </div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">Tuyệt vời!</p>
                <p className="text-slate-500 text-xs sm:text-sm">Không có thanh toán nào sắp đến hạn</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
