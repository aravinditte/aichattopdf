import Header from "@/components/Header";
import UrlInput from "@/components/UrlInput";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Home() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I convert a ChatGPT conversation to PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In ChatGPT, click the share button on your conversation and copy the public share link. Paste that link into AIChat to PDF and hit Generate — your PDF opens in the browser print dialog, ready to save.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I convert a Gemini conversation to PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Share your Gemini conversation to get a public link, paste it into AIChat to PDF, and generate. The full conversation — including code blocks and tables — is exported as a clean, printable PDF.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is AIChat to PDF free? Do I need an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, it is completely free. No account, login, or browser extension is required — just paste a share link and download your PDF.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are code blocks and formatting preserved in the PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Code blocks keep syntax highlighting, tables render properly, and headings, lists, and equations are formatted for a clean A4 PDF layout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my conversation data stored?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Conversations are fetched on demand, converted, and returned — nothing is stored. The PDF is generated right in your browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does AIChat to PDF work on mobile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The site is fully mobile-friendly — paste a share link on your phone, generate the PDF, and save or print it directly from your mobile browser.',
        },
      },
    ],
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badges}>
              <span className={styles.badge}>FREE</span>
              <span className={styles.badgeSeparator}>•</span>
              <span className={styles.badge}>NO LOGIN</span>
              <span className={styles.badgeSeparator}>•</span>
              <span className={styles.badge}>MOBILE FRIENDLY</span>
            </div>
            <h1 className={styles.heroTitle}>
              Convert ChatGPT &amp; Gemini Conversations
              <br />
              <span className={styles.heroAccent}>to Clean PDFs</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Paste a public ChatGPT or Gemini share link and instantly get a
              beautifully formatted PDF — code blocks, tables, and equations
              perfectly preserved. Free, no login, works on any device.
            </p>
            <UrlInput />
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Comparison Section */}
        <Comparison />

        {/* Target Users Section */}
        <section className={styles.usersSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Built For Everyone</h2>
            <p className={styles.sectionSubtitle}>
              Whether you&apos;re studying, coding, researching, or
              consulting — your AI conversations deserve a clean export.
            </p>
            <div className={styles.usersGrid}>
              <div className={styles.userCard}>
                <span className={styles.userEmoji}>🎓</span>
                <h3>Students</h3>
                <p>Save study conversations, summaries, and research notes for offline review</p>
              </div>
              <div className={styles.userCard}>
                <span className={styles.userEmoji}>💻</span>
                <h3>Developers</h3>
                <p>Preserve code snippets, debugging sessions, and technical discussions</p>
              </div>
              <div className={styles.userCard}>
                <span className={styles.userEmoji}>🔬</span>
                <h3>Researchers</h3>
                <p>Archive references, research conversations, and long-form analysis</p>
              </div>
              <div className={styles.userCard}>
                <span className={styles.userEmoji}>📋</span>
                <h3>Consultants</h3>
                <p>Create client documentation and AI-generated deliverables</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section — targets real search queries */}
        <section className={styles.usersSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know about converting AI chats to PDF.
            </p>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>How do I convert a ChatGPT conversation to PDF?</summary>
                <p>
                  In ChatGPT, click the share button on your conversation and copy
                  the public share link. Paste that link above and hit Generate —
                  your PDF opens in the browser print dialog, ready to save.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>How do I convert a Gemini conversation to PDF?</summary>
                <p>
                  Share your Gemini conversation to get a public link, paste it
                  above, and generate. The full conversation — including code
                  blocks and tables — is exported as a clean, printable PDF.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Is it free? Do I need an account?</summary>
                <p>
                  Yes, it&apos;s completely free, and no account, login, or
                  browser extension is required. Just paste a share link and
                  download your PDF.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Are code blocks and formatting preserved?</summary>
                <p>
                  Yes. Code blocks keep their syntax highlighting, tables render
                  properly, and headings, lists, and equations are all formatted
                  for a clean A4 PDF layout.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Is my conversation data stored?</summary>
                <p>
                  No. Conversations are fetched on demand, converted, and
                  returned — nothing is stored on any server. The PDF is
                  generated right in your browser.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Does it work on mobile?</summary>
                <p>
                  Yes. The site is fully mobile-friendly — paste a share link on
                  your phone, generate the PDF, and save or print it directly
                  from your mobile browser.
                </p>
              </details>
            </div>
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>
      <Footer />
    </>
  );
}
