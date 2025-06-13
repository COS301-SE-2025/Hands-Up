import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Help.css';

const faqs = [
  {
    question: "How do I use the Translator?",
    answer: "Go to the Translator page and use your webcam or upload an image to translate sign language into text."
  },
  {
    question: "How can I track my learning progress?",
    answer: "Visit your Profile page to see your stats, achievements, and progress history."
  },
  {
    question: "Who can I contact for support?",
    answer: "Scroll to the bottom of this page for support contact details."
  }
];

const HelpPage = () => {
  const [search, setSearch] = useState('');
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="help-container">
      <section className="help-section" aria-labelledby="help-main-title">
        <div className="help-content">
          <h1 id="help-main-title">Hands UP Help Center</h1>
          <p className="help-tagline">
            Your journey to mastering sign language starts here. Connect, learn, and translate with ease.
          </p>
          <div className="help-buttons">
            <Link to="/translator" className="help-btn-primary" aria-label="Start Translating">Start Translating</Link>
            <Link to="/learn" className="help-btn-secondary" aria-label="Begin Learning">Begin Learning</Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section className="help-search-section" aria-label="Search Help">
        <input
          type="text"
          className="help-search-input"
          placeholder="Search help topics or FAQs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search help topics"
        />
      </section>

      {/* Getting Better Results Section */}
      <section className="help-tips-section">
        <div className="help-tip-card">
          <div className="tip-header">
            <i className="fas fa-target tip-icon"></i>
            <h2>Getting Better Translation Results</h2>
          </div>
          <div className="tip-content">
            <p>Improve your translation accuracy with these essential tips for optimal camera setup and signing technique.</p>
            <div className="tip-grid">
              <div className="tip-item">
                <h4>Lighting & Environment</h4>
                <p>Use bright, even lighting and avoid shadows on your hands. Position yourself against a plain background.</p>
              </div>
              <div className="tip-item">
                <h4>Hand Positioning</h4>
                <p>Keep your hands clearly visible within the camera frame. Sign at a moderate pace for best recognition.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Effective Learning Section */}
      <section className="help-tips-section">
        <div className="help-tip-card">
          <div className="tip-header">
            <i className="fas fa-brain tip-icon"></i>
            <h2>Learning More Effectively</h2>
          </div>
          <div className="tip-content">
            <p>Maximize your learning potential with proven study techniques and practice strategies.</p>
            <div className="tip-grid">
              <div className="tip-item">
                <h4>Daily Practice</h4>
                <p>Consistency beats intensity. Practice 15-20 minutes daily rather than long irregular sessions.</p>
              </div>
              <div className="tip-item">
                <h4>Progressive Learning</h4>
                <p>Master basics first. Learn the alphabet and numbers before moving to complex phrases and sentences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Common Mistakes Section */}
      <section className="help-tips-section">
        <div className="help-tip-card">
          <div className="tip-header">
            <i className="fas fa-exclamation-triangle tip-icon"></i>
            <h2>Common Mistakes to Avoid</h2>
          </div>
          <div className="tip-content">
            <p>Learn from others' experiences and avoid these frequent pitfalls in sign language learning.</p>
            <div className="tip-grid">
              <div className="tip-item">
                <h4>Finger Spelling Rush</h4>
                <p>Don't rush through finger spelling. Take time to form each letter clearly and distinctly.</p>
              </div>
              <div className="tip-item">
                <h4>Facial Expression</h4>
                <p>Remember that facial expressions are crucial in sign language. Don't focus only on hand movements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Progress Tracking Section */}
      <section className="help-tips-section">
        <div className="help-tip-card">
          <div className="tip-header">
            <i className="fas fa-chart-line tip-icon"></i>
            <h2>Tracking Your Progress</h2>
          </div>
          <div className="tip-content">
            <p>Stay motivated and measure your improvement with smart tracking and goal-setting strategies.</p>
            <div className="tip-grid">
              <div className="tip-item">
                <h4>Set Realistic Goals</h4>
                <p>Break down your learning into achievable milestones. Celebrate small wins along your journey.</p>
              </div>
              <div className="tip-item">
                <h4>Regular Assessment</h4>
                <p>Use our built-in progress tracker to identify strengths and areas that need more practice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section className="faq-section" aria-label="Frequently Asked Questions">
        <h2>Frequently Asked Questions</h2>
        <ul className="faq-list">
          {filteredFaqs.length === 0 && <li>No results found.</li>}
          {filteredFaqs.map((faq, idx) => (
            <li key={idx} className="faq-item">
              <strong>{faq.question}</strong>
              <p>{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <hr className="divider" />

      <footer className="help-footer" aria-label="Support and Contact">
        <p>
          Need more help? Email us at <a href="mailto:tkmdt.cos301@gmail.com">tkmdt.cos301@gmail.com</a>
        </p>
      </footer>
    </div>
  );
};

export default HelpPage;