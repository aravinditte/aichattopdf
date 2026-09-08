'use client';

import React, { useState } from 'react';
import styles from './UrlInput.module.css';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
      setSuccess(null);
    } catch (err) {
      setError('Failed to read clipboard. Please paste manually.');
    }
  };

  const validateUrl = (urlStr) => {
    if (!urlStr) return false;
    return (
      urlStr.startsWith('https://chatgpt.com/share/') ||
      urlStr.startsWith('https://gemini.google.com/share/') ||
      urlStr.startsWith('https://share.gemini.google/')
    );
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess(null);
    
    if (!validateUrl(url)) {
      setError('Please enter a valid ChatGPT or Gemini share link.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || `Conversion failed (${response.status}). Please try again.`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      setSuccess({
        title: data.title || 'Conversation',
        messageCount: data.messageCount || 0
      });

      // Create a hidden iframe, write HTML, and print
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(data.html);
      doc.close();
      
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Cleanup after print dialog
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
      
    } catch (err) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type="url"
          className={styles.input}
          placeholder="Paste a ChatGPT or Gemini share link..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
            setSuccess(null);
          }}
          disabled={loading}
        />
      </div>
      
      <div className={styles.buttonGroup}>
        <button 
          className={styles.pasteButton} 
          onClick={handlePaste}
          disabled={loading}
        >
          Paste
        </button>
        <button 
          className={styles.generateButton} 
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.loadingContent}>
              <span className={styles.spinner}></span>
              Converting...
            </span>
          ) : 'Generate PDF'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className={styles.success}>
          Ready! '{success.title}' ({success.messageCount} messages) generated successfully.
        </div>
      )}

      <div className={styles.badges}>
        <span className={`${styles.badge} ${styles.chatgpt}`}>ChatGPT</span>
        <span className={`${styles.badge} ${styles.gemini}`}>Gemini</span>
      </div>
    </div>
  );
}
