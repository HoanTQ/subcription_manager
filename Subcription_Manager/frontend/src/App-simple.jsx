import React from 'react';
import { API_BASE_URL } from './utils/api';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Subscription Manager</h1>
      <p>Ứng dụng đang chạy thành công!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Connection</h2>
        <button onClick={() => {
          fetch(`${API_BASE_URL}/health`)
            .then(res => res.json())
            .then(data => alert('Backend OK: ' + JSON.stringify(data)))
            .catch(err => alert('Backend Error: ' + err.message));
        }}>
          Test Backend
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Hướng dẫn:</h3>
        <ol>
          <li>Nếu thấy trang này, frontend đã chạy OK</li>
          <li>Click "Test Backend" để kiểm tra kết nối API</li>
          <li>Nếu cả 2 OK, có thể chuyển về App.jsx chính</li>
        </ol>
      </div>
    </div>
  );
}

export default App;