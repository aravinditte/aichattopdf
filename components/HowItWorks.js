import React from 'react';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Paste Your Link',
      description: 'Copy the share URL from ChatGPT or Gemini and paste it here',
    },
    {
      number: '02',
      title: 'We Convert It',
      description: 'Our server fetches and formats your conversation with full fidelity',
    },
    {
      number: '03',
      title: 'Download PDF',
      description: 'Get a clean, print-ready PDF file instantly — no signup needed',
    },
  ];

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Three Simple Steps</h2>
        
        <div className={styles.stepsWrapper}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
