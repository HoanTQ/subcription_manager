import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  KeyRound, 
  CreditCard, 
  CalendarClock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

/**
 * Layout component với sidebar navigation hiện đại
 * Sử dụng glassmorphism và gradient effects
 */
const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Tổng quan' },
    { name: 'Tài khoản', href: '/accounts', icon: KeyRound, description: 'Quản lý tài khoản' },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard, description: 'Đăng ký dịch vụ' },
    { name: 'Sắp đến hạn', href: '/upcoming', icon: CalendarClock, description: 'Thanh toán sắp tới' },
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-lg border border-slate-200"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-40
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full m-4 glass rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Subscription</h1>
                <p className="text-xs text-slate-500">Manager Pro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                    transition-all duration-200 ease-out cursor-pointer
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors duration-200
                    ${active 
                      ? 'bg-white/20' 
                      : 'bg-slate-100 group-hover:bg-indigo-100'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-600 group-hover:text-indigo-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${active ? 'text-white' : ''}`}>{item.name}</p>
                    <p className={`text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{item.description}</p>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-white/70" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
              <div className="avatar avatar-md">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        <div className="p-4 pt-16 lg:pt-8 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
