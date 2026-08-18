import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '1',
    title: 'Paste Link',
    description: 'Copy your ChatGPT or Gemini share URL'
  },
  {
    number: '2',
    title: 'Convert',
    description: 'We extract and format the conversation'
  },
  {
    number: '3',
    title: 'Download',
    description: 'Get your clean, formatted PDF'
  }
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>How It Works</h2>
        <div className={styles.stepsWrapper}>
          <div className={styles.connectingLine}></div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.numberCircle}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
