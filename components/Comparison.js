import React from 'react';
import styles from './Comparison.module.css';

export default function Comparison() {
  const Check = () => <span className={styles.check}>✓</span>;
  const Cross = () => <span className={styles.cross}>✗</span>;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why AIChat to PDF?</h2>
          <p className={styles.subtitle}>Compare with common alternatives</p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.featureCol}>Feature</th>
                <th className={styles.highlightCol}>AIChat to PDF</th>
                <th>Browser Print</th>
                <th>Screenshot</th>
                <th>Copy/Paste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.featureCol}>Code Formatting</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Cross /></td>
                <td><Check /></td>
                <td><Cross /></td>
              </tr>
              <tr>
                <td className={styles.featureCol}>Table Layout</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Check /></td>
                <td><Check /></td>
                <td><Cross /></td>
              </tr>
              <tr>
                <td className={styles.featureCol}>Heading Hierarchy</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Check /></td>
                <td><Check /></td>
                <td><Cross /></td>
              </tr>
              <tr>
                <td className={styles.featureCol}>Mobile Support</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Cross /></td>
                <td><Cross /></td>
                <td><Check /></td>
              </tr>
              <tr>
                <td className={styles.featureCol}>No Extension Needed</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Check /></td>
                <td><Check /></td>
                <td><Check /></td>
              </tr>
              <tr>
                <td className={styles.featureCol}>One-Click Export</td>
                <td className={styles.highlightCol}><Check /></td>
                <td><Cross /></td>
                <td><Cross /></td>
                <td><Cross /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
