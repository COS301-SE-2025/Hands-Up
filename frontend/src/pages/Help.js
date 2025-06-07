import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Help.css';
import helpImage from '../Picture1.png';

const faqs = [
  {
    question: "How do I register for an account?",
    answer: (
      <>
        Go to the <Link to="/signup">Sign Up</Link> page and fill in your name, username, email, and password. All fields are required. Your password must be at least 8 characters, and your email must be valid. Duplicate usernames or emails are not allowed. Once registered, you'll be logged in and redirected to the learning homepage.
      </>
    )
  },
  {
    question: "How do I log in?",
    answer: (
      <>
        Visit the <Link to="/login">Login</Link> page and enter your email and password. Both fields are required. If your credentials are correct, you'll be logged in and taken to your learning homepage. If not, an error message will appear.
      </>
    )
  },
  {
    question: "What if I forget my password?",
    answer: (
      <>
        On the <Link to="/login">Login</Link> page, click "Forgot Password?" Enter your email address. If it exists, you'll receive a reset link. Follow the link to set a new password. After confirmation, you can log in with your new password.
      </>
    )
  },
  {
    question: "How do I update my profile?",
    answer: (
      <>
        Go to your <Link to="/userProfile">Profile</Link> page. You can edit your name, username, email, and password. All changes require valid input and confirmation before saving. Your updated details will be shown immediately.
      </>
    )
  },
  {
    question: "How can I track my learning progress?",
    answer: (
      <>
        On your <Link to="/userProfile">Profile</Link> page, you can view your achievements, day streak, and total XP. This data updates automatically as you complete learning tasks.
      </>
    )
  },
  {
    question: "How do I translate sign language using my camera?",
    answer: (
      <>
        Go to the <Link to="/translator">Translator</Link> page and allow camera access. Show your sign to the camera; the system will detect and translate it in real time to text and speech.
      </>
    )
  },
  {
    question: "Can I upload images or videos for translation?",
    answer: (
      <>
        Yes! On the <Link to="/translator">Translator</Link> page, use the upload option to select an image or video. Supported formats will be processed and translated to text and speech.
      </>
    )
  },
  {
    question: "Can I translate individual letters, phrases, or sentences?",
    answer: (
      <>
        Yes. The system recognizes individual letters, common phrases, and full sentences from your camera or uploads. Translations appear instantly as text and audio, and letters are shown in the correct order.
      </>
    )
  }
];

const howToSteps = [
  {
    title: "Registering an Account",
    steps: [
      "Go to the Sign Up page.",
      "Fill in your name, username, email, and password (minimum 8 characters).",
      "Make sure your email is valid and not already used.",
      "Click 'Sign Up'. You’ll be logged in and redirected to the learning homepage."
    ]
  },
  {
    title: "Logging In",
    steps: [
      "Go to the Login page.",
      "Enter your registered email and password.",
      "Click 'Login'. If your credentials are correct, you’ll be redirected to your learning homepage."
    ]
  },
  {
    title: "Resetting Your Password",
    steps: [
      "On the Login page, click 'Forgot Password?'.",
      "Enter your email address and submit.",
      "Check your email for a reset link.",
      "Follow the link to set a new password and confirm."
    ]
  },
  {
    title: "Updating Your Profile",
    steps: [
      "Go to your Profile page.",
      "Edit your name, username, email, or password as needed.",
      "Save your changes. You’ll see a confirmation and your updated info."
    ]
  },
  {
    title: "Tracking Your Progress",
    steps: [
      "Visit your Profile page.",
      "View your achievements, day streak, and total XP.",
      "Progress updates automatically as you learn."
    ]
  },
  {
    title: "Translating with Camera",
    steps: [
      "Go to the Translator page.",
      "Allow camera access if prompted.",
      "Show your sign to the camera. The system will detect and translate it in real time."
    ]
  },
  {
    title: "Uploading Images or Videos",
    steps: [
      "On the Translator page, click the upload button.",
      "Select an image or video file (supported formats only).",
      "The system will process and translate your upload."
    ]
  },
  {
    title: "Translating Letters, Phrases, and Sentences",
    steps: [
      "Use the camera or upload feature on the Translator page.",
      "Sign individual letters, phrases, or sentences.",
      "Translations will appear instantly as text and audio."
    ]
  }
];

const HelpPage = () => {
  const [search, setSearch] = useState('');
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    (typeof faq.answer === 'string'
      ? faq.answer.toLowerCase().includes(search.toLowerCase())
      : false)
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
            <p>Instantly translate sign language into words, phrases, or sentences using your camera or uploads.</p>
          </Link>
          <Link to="/learn" className="feature-card" aria-label="Learn & Practice feature">
            <i className="fas fa-book-open feature-icon" aria-hidden="true"></i>
            <h3>Learn & Practice</h3>
            <p>Interactive lessons, quizzes, and practice exercises to help you master sign language.</p>
          </Link>
          <Link to="/userProfile" className="feature-card" aria-label="Your Profile feature">
            <i className="fas fa-user-circle feature-icon" aria-hidden="true"></i>
            <h3>Your Profile</h3>
            <p>Track your learning progress, achievements, and manage your account settings.</p>
          </Link>
        </div>
      </section>

      <hr className="divider" />

      <section className="howto-section" aria-label="Common Questions and How-To">
        <h2>Common Questions & How-To</h2>
        <div className="howto-list">
          {howToSteps.map((item, idx) => (
            <div className="howto-card" key={idx}>
              <h3>{item.title}</h3>
              <ol>
                {item.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
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