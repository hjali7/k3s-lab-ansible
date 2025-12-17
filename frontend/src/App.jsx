import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiLink, FiCopy, FiTrash2, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { RiRocketLine } from 'react-icons/ri';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastShortened, setLastShortened] = useState(null);

  const BACKEND_URL = "http://shorter.46.34.163.151.nip.io/shorten";

  useEffect(() => {
    const savedHistory = localStorage.getItem('linkHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('linkHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a URL first!");
      return;
    }
    
    setLoading(true);
    setLastShortened(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to contact server');

      const data = await response.json();
      
      const newEntry = {
        id: Date.now(),
        original: url,
        short: data.short_url
      };
      
      setHistory([newEntry, ...history]);
      setLastShortened(data.short_url);
      setUrl('');
      toast.success("Link shortened successfully!");
      
    } catch (err) {
      toast.error('Error: Is the backend container running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast('Link copied to clipboard!', { icon: '📋' });
  };

  const deleteItem = (id) => {
    setHistory(history.filter(item => item.id !== id));
    if (history.length === 1) setLastShortened(null);
    toast.success('Item deleted from history');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const listVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}/>

      <div className="sidebar">
        <h2><FiActivity /> Recent Links ({history.length})</h2>
        <div className="history-list">
          <AnimatePresence>
            {history.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{color:'var(--text-muted)', fontSize:'0.9rem', fontStyle:'italic'}}>
                Your shortened links will appear here.
              </motion.p>
            )}
            
            {history.map((item) => (
              <motion.div 
                key={item.id} 
                className="history-item"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <a href={item.short} target="_blank" rel="noreferrer" className="history-short">
                  {item.short.replace('http://', '')}
                </a>
                <span className="history-original" title={item.original}>
                  <FiLink style={{marginRight:4, verticalAlign:'middle'}}/> 
                  {item.original.replace('https://', '').replace('http://', '')}
                </span>
                
                <div className="history-actions">
                  <button className="btn-icon btn-copy" onClick={() => copyToClipboard(item.short)}>
                    <FiCopy /> Copy
                  </button>
                  <button className="btn-icon btn-del" onClick={() => deleteItem(item.id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="main-content">
        <motion.div 
          className="card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="brand">
            <h1>DevOps <span className="gradient-text">Shortener</span></h1>
            <p style={{color:'var(--text-muted)', marginTop:'8px'}}>
              Enterprise-grade URL shortening service.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FiLink className="input-icon" />
              <input
                type="url"
                placeholder="Paste long URL (e.g., https://github.com/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <motion.button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Processing...' : <><RiRocketLine /> Shorten Now</>}
            </motion.button>
          </form>

          <AnimatePresence>
            {lastShortened && !loading && (
              <motion.div 
                className="result-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="success-message">
                  <FiCheckCircle size={20} /> Link ready & QR Code generated!
                </div>
                
                <motion.div 
                  className="qr-box"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <QRCodeSVG 
                    value={lastShortened} 
                    size={140}
                    level={"H"}
                    includeMargin={true}
                  />
                  <span className="qr-label">Scan to open on mobile</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}

export default App;