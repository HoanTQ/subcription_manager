import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  PlusIcon, 
  EyeIcon, 
  EyeOffIcon, 
  EditIcon, 
  TrashIcon,
  CopyIcon,
  ExternalLinkIcon
} from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    serviceName: '',
    loginId: '',
    password: '',
    url: '',
    notes: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts');
      if (response.data.success) {
        setAccounts(response.data.data.accounts);
      }
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
      console.error('Fetch accounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        const response = await api.put(`/accounts/${editingAccount.accountId}`, formData);
        if (response.data.success) {
          await fetchAccounts();
          resetForm();
        }
      } else {
        const response = await api.post('/accounts', formData);
        if (response.data.success) {
          await fetchAccounts();
          resetForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      serviceName: account.serviceName,
      loginId: account.loginId,
      password: '',
      url: account.url || '',
      notes: account.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await api.delete(`/accounts/${accountId}`);
        await fetchAccounts();
      } catch (err) {
        setError('Không thể xóa tài khoản');
      }
    }
  };

  const revealPassword = async (accountId) => {
    try {
      const response = await api.post(`/accounts/${accountId}/reveal-password`);
      if (response.data.success) {
        setRevealedPasswords(prev => ({
          ...prev,
          [accountId]: response.data.data.password
        }));
      }
    } catch (err) {
      setError('Không thể hiển thị mật khẩu');
    }
  };

  const hidePassword = (accountId) => {
    setRevealedPasswords(prev => {
      const newState = { ...prev };
      delete newState[accountId];
      return newState;
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      loginId: '',
      password: '',
      url: '',
      notes: ''
    });
    setEditingAccount(null);
    setShowModal(false);
  };

  const filteredAccounts = accounts.filter(account =>
    account.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Tài khoản</h1>
          <p className="text-gray-600">Quản lý thông tin đăng nhập các dịch vụ</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm tài khoản
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Accounts List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredAccounts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAccounts.map((account) => (
              <div key={account.accountId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.serviceName}
                      </h3>
                      {account.url && (
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-20">Login ID:</span>
                        <span className="text-sm text-gray-900 mr-2">{account.loginId}</span>
                        <button
                          onClick={() => copyToClipboard(account.loginId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-20">Password:</span>
                        {revealedPasswords[account.accountId] ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2 font-mono">
                              {revealedPasswords[account.accountId]}
                            </span>
                            <button
                              onClick={() => copyToClipboard(revealedPasswords[account.accountId])}
                              className="text-gray-400 hover:text-gray-600 mr-2"
                            >
                              <CopyIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => hidePassword(account.accountId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <EyeOffIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">••••••••</span>
                            <button
                              onClick={() => revealPassword(account.accountId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {account.notes && (
                        <div className="flex items-start">
                          <span className="text-sm text-gray-500 w-20">Notes:</span>
                          <span className="text-sm text-gray-900">{account.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.accountId)}
                      className="text-red-600 hover:text-red-800"
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
            {searchTerm ? 'Không tìm thấy tài khoản nào' : 'Chưa có tài khoản nào'}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
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
                    Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.loginId}
                    onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu {editingAccount ? '(để trống nếu không đổi)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingAccount}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
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
                    {editingAccount ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;