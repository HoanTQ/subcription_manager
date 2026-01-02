import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, Copy, Search, KeyRound, Globe, CheckCircle2
} from 'lucide-react';
import Toast from '../components/Toast';
import ServiceIcon from '../components/ServiceIcon';

/**
 * Accounts page với thiết kế hiện đại
 * Quản lý thông tin đăng nhập các dịch vụ
 */
const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    serviceName: '', loginId: '', password: '', url: '', notes: ''
  });

  const showSuccess = (message) => setToast({ message, type: 'success' });
  const showError = (message) => setToast({ message, type: 'error' });

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts');
      if (response.data.success) setAccounts(response.data.data.accounts);
    } catch (err) {
      showError('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        const response = await api.put(`/accounts/${editingAccount.accountId}`, formData);
        if (response.data.success) { await fetchAccounts(); resetForm(); showSuccess('Cập nhật tài khoản thành công!'); }
      } else {
        const response = await api.post('/accounts', formData);
        if (response.data.success) { await fetchAccounts(); resetForm(); showSuccess('Tạo tài khoản thành công!'); }
      }
    } catch (err) {
      showError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({ serviceName: account.serviceName, loginId: account.loginId, password: '', url: account.url || '', notes: account.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await api.delete(`/accounts/${accountId}`);
        await fetchAccounts();
        showSuccess('Xóa tài khoản thành công!');
      } catch (err) {
        showError('Không thể xóa tài khoản');
      }
    }
  };

  const handleRevealPassword = async (accountId) => {
    if (revealedPasswords[accountId]) {
      setRevealedPasswords(prev => ({ ...prev, [accountId]: null }));
      return;
    }
    try {
      const response = await api.post(`/accounts/${accountId}/reveal-password`);
      if (response.data.success) {
        setRevealedPasswords(prev => ({ ...prev, [accountId]: response.data.data.password }));
        setTimeout(() => setRevealedPasswords(prev => ({ ...prev, [accountId]: null })), 30000);
      }
    } catch (err) {
      showError('Không thể hiển thị mật khẩu');
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showError('Không thể copy');
    }
  };

  const resetForm = () => {
    setFormData({ serviceName: '', loginId: '', password: '', url: '', notes: '' });
    setEditingAccount(null);
    setShowModal(false);
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.loginId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Tài khoản</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Quản lý thông tin đăng nhập các dịch vụ</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Search */}
      <div className="card-modern p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm tài khoản..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-modern pl-10 sm:pl-12" />
        </div>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredAccounts.map((account) => (
            <div key={account.accountId} className="card-modern p-6 card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ServiceIcon serviceName={account.serviceName} size="lg" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{account.serviceName}</h3>
                    {account.url && (
                      <a href={account.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Truy cập
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Login ID */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tài khoản</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm text-slate-900 flex-1 truncate">{account.loginId}</p>
                  <button onClick={() => copyToClipboard(account.loginId, `login-${account.accountId}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                    {copiedId === `login-${account.accountId}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mật khẩu</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm text-slate-900 flex-1">
                    {revealedPasswords[account.accountId] || '••••••••'}
                  </p>
                  <button onClick={() => handleRevealPassword(account.accountId)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                    {revealedPasswords[account.accountId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {revealedPasswords[account.accountId] && (
                    <button onClick={() => copyToClipboard(revealedPasswords[account.accountId], `pass-${account.accountId}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                      {copiedId === `pass-${account.accountId}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => handleEdit(account)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Sửa">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(account.accountId)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-modern p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {accounts.length === 0 ? 'Chưa có tài khoản nào' : 'Không tìm thấy kết quả'}
          </h3>
          <p className="text-slate-500 mb-4">Bắt đầu bằng cách thêm tài khoản đầu tiên</p>
          {accounts.length === 0 && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài khoản
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {editingAccount ? 'Cập nhật thông tin đăng nhập' : 'Lưu trữ thông tin đăng nhập an toàn'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên dịch vụ *</label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="input-modern"
                  placeholder="VD: Netflix, Spotify..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tài khoản đăng nhập *</label>
                <input
                  type="text"
                  value={formData.loginId}
                  onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                  className="input-modern"
                  placeholder="Email hoặc username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu {editingAccount ? '(để trống nếu không đổi)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-modern pr-10"
                    placeholder="••••••••"
                    required={!editingAccount}
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">URL website</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-modern"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-modern resize-none"
                  rows={3}
                  placeholder="Thông tin bổ sung..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1 cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">
                  {editingAccount ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;