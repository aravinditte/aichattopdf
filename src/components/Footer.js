import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <span className={styles.logoText}>AIChat to PDF</span>
            <p className={styles.copyright}>&copy; {year} AIChat to PDF.</p>
          </div>
          <div className={styles.info}>
            <p className={styles.privacy}>
              No data stored. Conversations are processed and immediately discarded.
            </p>
            <p className={styles.teaser}>
              Expanding to more AI platforms soon.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
