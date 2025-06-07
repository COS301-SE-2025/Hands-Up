import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Help.css';
import helpImage from '../Picture1.png';

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
          <h1 id="help-main-title">Welcome to Hands UP Help Center</h1>
          <p className="help-tagline">
            Your journey to mastering sign language starts here. Connect, learn, and translate with ease.
          </p>
          <div className="help-buttons">
            <Link to="/translator" className="btn-primary" aria-label="Start Translating">Start Translating</Link>
            <Link to="/learn" className="btn-secondary" aria-label="Begin Learning">Begin Learning</Link>
          </div>
        </div>
        <div className="help-image">
          <img src={helpImage} alt="Sign Language illustration" />
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

      <section className="features-section" aria-label="Feature Highlights">
        <h2>Explore Our Features</h2>
        <div className="feature-grid">
          <Link to="/translator" className="feature-card" aria-label="Translator feature">
            <i className="fas fa-hand-paper feature-icon" aria-hidden="true"></i>
            <h3>Translator</h3>
            <p>Instantly translate sign language into words or phrases.</p>
          </Link>
          <Link to="/learn" className="feature-card" aria-label="Learn & Practice feature">
            <i className="fas fa-book-open feature-icon" aria-hidden="true"></i>
            <h3>Learn & Practice</h3>
            <p>Dive into interactive lessons, quizzes, and practice exercises.</p>
          </Link>
          <Link to="/userProfile" className="feature-card" aria-label="Your Profile feature">
            <i className="fas fa-user-circle feature-icon" aria-hidden="true"></i>
            <h3>Your Profile</h3>
            <p>Track your learning progress and manage your account settings.</p>
          </Link>
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

      <section className="cta-section" aria-label="Get Started">
        <h2>Ready to Communicate?</h2>
        <p>Join thousands of users who are bridging communication gaps with Hands UP.</p>
        <Link to="/signup" className="btn-primary large" aria-label="Get Started for Free">Get Started for Free</Link>
      </section>

      <footer className="help-footer" aria-label="Support and Contact">
        <p>
          Need more help? Email us at <a href="mailto:support@handsup.com">support@handsup.com</a>
        </p>
        <p>
          &copy; {new Date().getFullYear()} Hands UP. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HelpPage;