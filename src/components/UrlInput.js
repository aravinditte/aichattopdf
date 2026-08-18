'use client';

import { useState } from 'react';
import styles from './UrlInput.module.css';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch (err) {
      console.error('Failed to read clipboard text: ', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate PDF. Please check the URL and try again.');
      }

      const data = await res.json();
      
      if (!data.html) {
        throw new Error('Invalid response from server.');
      }

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(data.html);
      iframe.contentWindow.document.close();
      
      iframe.onload = function() {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
      
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="url"
            className={styles.input}
            placeholder="Paste your ChatGPT or Gemini share link..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            disabled={loading}
            required
          />
          <button 
            type="button" 
            className={styles.pasteButton}
            onClick={handlePaste}
            disabled={loading}
            aria-label="Paste from clipboard"
          >
            Paste
          </button>
        </div>
        <button type="submit" className={styles.submitButton} disabled={loading || !url}>
          {loading ? (
            <span className={styles.loadingContent}>
              <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Converting...
            </span>
          ) : (
            'Generate PDF'
          )}
        </button>
      </form>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.supportedText}>
        Supports: <strong>ChatGPT</strong> &bull; <strong>Gemini</strong>
      </div>
    </div>
  );
}
