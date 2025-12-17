import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // آدرس بک‌ند (آدرس اینگرس بک‌ند خودت رو اینجا چک کن)
  const BACKEND_URL = "http://shorter.46.34.163.151.nip.io/shorten";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to shorten link');

      const data = await response.json();
      setShortUrl(data.short_url);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>
        <span className="gradient-text">DevOps</span> Shortener
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Enter your long URL</label>
          <input
            type="url"
            placeholder="https://example.com/very/long/url..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Shorten Now ✨'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {shortUrl && (
        <div className="result">
          <span>Success! Here is your link:</span>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-link">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;