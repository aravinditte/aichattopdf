import styles from './Comparison.module.css';

const rows = [
  { feature: 'Code Formatting', aichat: true, browser: false, screenshot: true, copypaste: false },
  { feature: 'Tables', aichat: true, browser: 'partial', screenshot: true, copypaste: false },
  { feature: 'Equations', aichat: true, browser: 'partial', screenshot: true, copypaste: false },
  { feature: 'Page Breaks', aichat: true, browser: false, screenshot: false, copypaste: true },
  { feature: 'Mobile Support', aichat: true, browser: false, screenshot: true, copypaste: true },
  { feature: 'Searchable Text', aichat: true, browser: true, screenshot: false, copypaste: true },
  { feature: 'One Click', aichat: true, browser: false, screenshot: false, copypaste: false },
];

const Check = () => <span className={styles.check}>&check;</span>;
const Cross = () => <span className={styles.cross}>&times;</span>;
const Partial = () => <span className={styles.partial}>~</span>;

const getIcon = (val) => {
  if (val === true) return <Check />;
  if (val === false) return <Cross />;
  return <Partial />;
};

export default function Comparison() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Why AIChat to PDF?</h2>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className={styles.highlightHeader}>AIChat to PDF</th>
                <th>Browser Print</th>
                <th>Screenshots</th>
                <th>Copy/Paste</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td className={styles.highlightCell}>{getIcon(row.aichat)}</td>
                  <td>{getIcon(row.browser)}</td>
                  <td>{getIcon(row.screenshot)}</td>
                  <td>{getIcon(row.copypaste)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
