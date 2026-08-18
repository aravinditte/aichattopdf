import styles from './Features.module.css';

const featuresData = [
  {
    icon: '💻',
    title: 'Code Blocks',
    description: 'Syntax-highlighted code with proper formatting'
  },
  {
    icon: '📊',
    title: 'Tables',
    description: 'Clean table layouts that don\'t break across pages'
  },
  {
    icon: '∑',
    title: 'Math & Equations',
    description: 'LaTeX and mathematical notation preserved'
  },
  {
    icon: '📝',
    title: 'Headings & Structure',
    description: 'Full heading hierarchy maintained'
  },
  {
    icon: '📑',
    title: 'Lists & Nesting',
    description: 'Ordered, unordered, and nested lists'
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    description: 'Works perfectly on phones and tablets'
  }
];

export default function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Preserves Everything That Matters</h2>
        <div className={styles.grid}>
          {featuresData.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
