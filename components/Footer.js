import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.brand}>AIChat to PDF</span>
          <span className={styles.tagline}>Convert AI conversations to clean PDFs</span>
        </div>
        
        <div className={styles.center}>
          <span className={styles.privacy}>
            🔒 No data stored. Conversations are processed and immediately discarded.
          </span>
        </div>

        <div className={styles.right}>
          <span className={styles.expanding}>Expanding to more AI platforms soon</span>
          <span className={styles.copyright}>© {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}
