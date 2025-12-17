import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // آدرس بک‌ند (چون HTTPS فعال کردیم، حتما https باشد)
  const BACKEND_URL = "https://shorter.46.34.163.151.nip.io/shorten";

  // 1. بارگذاری تاریخچه از LocalStorage هنگام اجرای برنامه
  useEffect(() => {
    const savedHistory = localStorage.getItem('linkHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 2. ذخیره تاریخچه در LocalStorage هر وقت لیست تغییر کرد
  useEffect(() => {
    localStorage.setItem('linkHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to shorten link');

      const data = await response.json();
      
      // اضافه کردن به تاریخچه (لینک جدید اول لیست بیاید)
      const newEntry = {
        id: Date.now(),
        original: url,
        short: data.short_url
      };
      
      setHistory([newEntry, ...history]);
      
      // پاک کردن ورودی
      setUrl('');
      
    } catch (err) {
      setError('Error: Could not shorten link. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard! 📋');
  };

  const deleteItem = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  return (
    <div className="app-layout">
      
      {/* سایدبار: تاریخچه */}
      <div className="sidebar">
        <h2>📜 History ({history.length})</h2>
        <div className="history-list">
          {history.length === 0 && <p style={{color:'#94a3b8'}}>No links yet. Try shortening one!</p>}
          
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <a href={item.short} target="_blank" rel="noreferrer" className="history-short">
                {item.short}
              </a>
              <span className="history-original" title={item.original}>{item.original}</span>
              
              <div className="history-actions">
                <button className="btn-xs btn-copy" onClick={() => copyToClipboard(item.short)}>
                  Copy 📋
                </button>
                <button className="btn-xs btn-del" onClick={() => deleteItem(item.id)}>
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* بخش اصلی: فرم */}
      <div className="main-content">
        <div className="card">
          <h1>DevOps <span className="gradient-text">Shortener</span></h1>
          
          <form onSubmit={handleSubmit}>
            <input
              type="url"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Shortening...' : 'Shorten URL 🚀'}
            </button>
          </form>

          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>

    </div>
  );
}

export default App;