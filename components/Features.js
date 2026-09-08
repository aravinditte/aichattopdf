import React from 'react';
import styles from './Features.module.css';

export default function Features() {
  const features = [
    {
      title: 'Code Blocks',
      icon: '</>',
      description: 'Syntax-highlighted code blocks with language labels and proper indentation',
    },
    {
      title: 'Tables',
      icon: '⊞',
      description: 'Properly formatted tables with borders, alignment, and responsive sizing',
    },
    {
      title: 'Headings & Lists',
      icon: '≡',
      description: 'Complete heading hierarchy (H1-H6) and nested ordered/unordered lists',
    },
    {
      title: 'Math & Equations',
      icon: '∑',
      description: 'LaTeX equations and mathematical notation rendered correctly',
    },
    {
      title: 'Quotes & Links',
      icon: '❝',
      description: 'Blockquotes, inline links, and text formatting preserved',
    },
    {
      title: 'Mobile Ready',
      icon: '◱',
      description: 'Generate PDFs from any device — phone, tablet, or desktop',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>What We Preserve</h2>
          <p className={styles.subtitle}>Every element of your conversation, perfectly formatted.</p>
        </div>
        
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{feature.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
