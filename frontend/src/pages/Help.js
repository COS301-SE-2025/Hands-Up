import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Help.css';
import helpImage from '../Picture1.png';

const faqs = [
  {
    question: "How do I create and customize my account?",
    answer: (
      <>
        Go to the <Link to="/signup">Sign Up</Link> page to create your account. All fields (name, username, email, password) are required. Your password must be at least 8 characters, and your email must be valid and unique. After registering, you can set learning goals and preferences in your profile settings.
      </>
    )
  },
  {
    question: "How do I log into my account?",
    answer: (
      <>
        Visit the <Link to="/login">Login</Link> page and enter your email and password. If your credentials are correct, you’ll be logged in and redirected to your learning dashboard.
      </>
    )
  },
  {
    question: "How do I reset my password if I forget it?",
    answer: (
      <>
        On the <Link to="/login">Login</Link> asdf
      </>
    )
  },
  {
    question: "How can I update my profile and learning preferences?",
    answer: (
      <>
        Go to your <Link to="/userProfile">Profile</Link> page to edit your name, username, email, password, learning goals, and preferred sign language dialect. All changes require confirmation and are securely saved.
      </>
    )
  },
  {
    question: "How do I input signs for translation?",
    answer: (
      <>
        On the <Link to="/translator">Translator</Link> page, you can use your device’s camera for real-time sign input, or upload images/videos. The system supports multiple sign language dialects and adapts translations accordingly.
      </>
    )
  },
  {
    question: "What kind of translation output is provided?",
    answer: (
      <>
        The application provides both text and audio output for all translations. You can see the translated text instantly and listen to the spoken result.
      </>
    )
  },
  {
    question: "How does the learning curriculum work?",
    answer: (
      <>
        The <Link to="/learn">Learn</Link> section offers a structured curriculum, starting from basics and progressing to advanced topics. Each lesson includes objectives, interactive content, and practice exercises. You can view the full course overview and track your progress.
      </>
    )
  },
  {
    question: "Will I get feedback if I make a mistake?",
    answer: (
      <>
        Yes! The system provides real-time feedback and correction. If a sign is incorrect, you’ll receive immediate suggestions for the correct gesture or movement.
      </>
    )
  },
  {
    question: "How can I track my learning progress?",
    answer: (
      <>
        On your <Link to="/userProfile">Profile</Link> page, you can view your daily streak, total XP, achievements, and a graphical analysis of your progress. All data updates automatically as you learn and play games.
      </>
    )
  },
  {
    question: "Can I change the sign language dialect?",
    answer: (
      <>
        Yes. In your profile settings, you can select your preferred sign language dialect. All content, translation, and feedback will adapt to your choice.
      </>
    )
  },
  {
    question: "Is there a game to test my sign language knowledge?",
    answer: (
      <>
        Yes! The built-in game offers challenges and quizzes. Your scores contribute to your overall progress, and you can replay the game anytime to improve.
      </>
    )
  },
  {
    question: "Is my data secure and private?",
    answer: (
      <>
        Absolutely. All data is securely stored and transmitted using industry best practices (e.g., HTTPS, secure authentication). The app complies with privacy regulations and never shares your information without consent.
      </>
    )
  },
  {
    question: "Can I use the app offline?",
    answer: (
      <>
        As a Progressive Web App (PWA), Hands UP offers limited offline support. You can access cached lessons and recent translations even without an internet connection.
      </>
    )
  },
  {
    question: "What devices and browsers are supported?",
    answer: (
      <>
        Hands UP works on any modern web browser and device. No manual setup is required—just visit the site and start learning!
      </>
    )
  }
];

const howToSteps = [
  {
    title: "Creating and Customizing Your Account",
    steps: [
      "Go to the Sign Up page.",
      "Fill in your name, username, email, and password (minimum 8 characters).",
      "Set your learning goals and preferred sign language dialect.",
      "Click 'Sign Up'. You’ll be logged in and redirected to your dashboard."
    ]
  },
  {
    title: "Logging In",
    steps: [
      "Go to the Login page.",
      "Enter your registered email and password.",
      "Click 'Login'. If your credentials are correct, you’ll be redirected to your dashboard."
    ]
  },
  {
    title: "Resetting Your Password",
    steps: [
      "On the Login page, click 'Forgot Password?'.",
      "Enter your email address and submit.",
      "Check your email for a secure reset link.",
      "Follow the link to set a new password and confirm."
    ]
  },
  {
    title: "Updating Your Profile and Preferences",
    steps: [
      "Go to your Profile page.",
      "Edit your name, username, email, password, learning goals, or preferred dialect.",
      "Save your changes. You’ll see a confirmation and your updated info."
    ]
  },
  {
    title: "Inputting Signs with Camera",
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
    title: "Getting Text and Audio Output",
    steps: [
      "After translating a sign, view the text output on screen.",
      "Click the speaker icon to listen to the audio output."
    ]
  },
  {
    title: "Exploring the Learning Curriculum",
    steps: [
      "Go to the Learn section.",
      "Browse the course overview and select a lesson.",
      "Complete interactive content and practice exercises.",
      "Progress from basic to advanced topics at your own pace."
    ]
  },
  {
    title: "Receiving Real-Time Feedback",
    steps: [
      "During translation or practice, watch for instant feedback.",
      "If a sign is incorrect, review the suggested correction and try again."
    ]
  },
  {
    title: "Tracking Your Progress",
    steps: [
      "Visit your Profile page.",
      "View your daily streak, total XP, achievements, and progress charts.",
      "Play the built-in game to earn more XP and achievements."
    ]
  },
  {
    title: "Changing Sign Language Dialect",
    steps: [
      "Go to your Profile settings.",
      "Select your preferred sign language dialect.",
      "All content and translations will update to match your choice."
    ]
  },
  {
    title: "Using the Built-In Game",
    steps: [
      "Go to the Game section from the main menu.",
      "Start a challenge or quiz.",
      "Earn scores that contribute to your overall progress.",
      "Replay the game anytime to improve your skills."
    ]
  },
  {
    title: "Using Hands UP Offline",
    steps: [
      "Add Hands UP to your home screen (as a PWA).",
      "Access cached lessons and recent translations even without internet.",
      "Full features require an internet connection."
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