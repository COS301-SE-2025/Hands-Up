import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Phone, 
  FileText, 
  PlayCircle,
  Camera,
  User,
  Home,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import '../styles/Help.css'; // or Help.css, match your file name

const tips = [
  "Tip: Use the camera in a well-lit area for best translation accuracy.",
  "Tip: Set learning reminders in your profile to stay on track!",
  "Tip: Try the built-in game to boost your XP and have fun.",
  "Tip: You can change your preferred sign language dialect in settings.",
  "Tip: Practice daily to keep your streak and earn more achievements.",
  "Tip: Upload clear images or videos for better translation results.",
  "Tip: Explore interactive lessons for hands-on learning.",
  "Tip: Use the audio output to practice pronunciation."
];

function getRandomTip() {
  return tips[Math.floor(Math.random() * tips.length)];
}

const HelpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const [randomTip] = useState(getRandomTip());

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <PlayCircle className="help-icon" />,
      items: [
        'Creating your first account',
        'Understanding the interface',
        'Setting up your camera',
        'Your first sign translation'
      ]
    },
    {
      id: 'learning',
      title: 'Learning Mode',
      icon: <GraduationCap className="help-icon" />,
      items: [
        'Accessing the curriculum',
        'Tracking your progress',
        'Understanding XP and streaks',
        'Lesson structure and feedback',
        'Practice exercises'
      ]
    },
    {
      id: 'translation',
      title: 'Video Translation',
      icon: <Camera className="help-icon" />,
      items: [
        'Using camera input',
        'Uploading videos/images',
        'Real-time translation tips',
        'Improving accuracy',
        'Supported sign languages'
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      icon: <User className="help-icon" />,
      items: [
        'Updating personal details',
        'Managing account settings',
        'Changing preferences',
        'Password reset',
        'Privacy settings'
      ]
    }
  ];

  const faqs = [
    {
      question: "How accurate is the sign language translation?",
      answer: "Our AI model achieves high accuracy for common signs and phrases. For best results, ensure good lighting and clear hand visibility."
    },
    {
      question: "Can I use the app offline?",
      answer: "Yes! As a PWA, you can access cached lessons and recent translations offline. Real-time translation requires an internet connection."
    },
    {
      question: "Which sign languages are supported?",
      answer: "We currently support American Sign Language (ASL) with plans to add more dialects. You can change your preferred dialect in settings."
    },
    {
      question: "How do I improve my signing accuracy?",
      answer: "Follow the feedback provided after each practice session, ensure good lighting, and keep your hands clearly visible to the camera."
    }
  ];

  const HelpButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="help-button"
      aria-label="Open help menu"
    >
      <HelpCircle className="help-button-icon" />
    </button>
  );

  // Filter help items and FAQs based on searchQuery
  const filteredHelpItems = helpSections
    .flatMap(section =>
      section.items
        .filter(item =>
          item.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        .map(item => ({
          sectionTitle: section.title,
          item
        }))
    );

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const HelpModal = () => (
    <div className="help-modal-overlay">
      <div className="help-modal">
        {/* Header */}
        <div className="help-modal-header">
          <div className="help-modal-header-content">
            <div className="help-modal-header-left">
              <div className="help-modal-header-icon">
                <HelpCircle className="help-modal-icon" />
              </div>
              <div className="help-modal-header-text">
                <h2 className="help-modal-title">Hands UP Help Center</h2>
                <p className="help-modal-subtitle">Get help with sign language learning</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="help-modal-close"
            >
              <X className="help-modal-close-icon" />
            </button>
          </div>
        </div>

        <div className="help-modal-body">
          {/* Sidebar */}
          <div className="help-sidebar">
            <div className="help-sidebar-content">
              {/* Search Bar */}
              <div className="help-search-container">
                <Search className="help-search-icon" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="help-search-input"
                />
              </div>

              {/* Quick Actions */}
              <div className="help-quick-actions">
                <button className="help-quick-action">
                  <MessageCircle className="help-quick-action-icon green" />
                  <span className="help-quick-action-text">Live Chat Support</span>
                </button>
                <button className="help-quick-action">
                  <Phone className="help-quick-action-icon blue" />
                  <span className="help-quick-action-text">Contact Support</span>
                </button>
                <button className="help-quick-action">
                  <Video className="help-quick-action-icon purple" />
                  <span className="help-quick-action-text">Video Tutorials</span>
                </button>
              </div>

              {/* Help Sections */}
              <div className="help-sections">
                <h3 className="help-sections-title">Help Topics</h3>
                {helpSections.map((section) => (
                  <div key={section.id} className="help-section">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="help-section-button"
                    >
                      <div className="help-section-left">
                        {section.icon}
                        <span className="help-section-title">{section.title}</span>
                      </div>
                      {expandedSection === section.id ? 
                        <ChevronDown className="help-chevron" /> : 
                        <ChevronRight className="help-chevron" />
                      }
                    </button>
                    {expandedSection === section.id && (
                      <div className="help-section-items">
                        {section.items.map((item, index) => (
                          <button
                            key={index}
                            className="help-section-item"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="help-main-content">
            <div className="help-content-inner">
              {/* Random Tip Banner */}
              <div className="help-tip-banner">
                <span role="img" aria-label="lightbulb">💡</span> {randomTip}
              </div>

              {searchQuery.trim() === '' ? (
                <>
                  {/* Default Welcome Content */}
                  <div className="help-welcome">
                    <h3 className="help-welcome-title">Welcome to Hands UP!</h3>
                    <p className="help-welcome-text">
                      Learn sign language with AI-powered translation and interactive lessons. 
                      Get started with our quick tutorials or browse help topics on the left.
                    </p>
                    
                    {/* Quick Start Cards */}
                    <div className="help-quick-start-grid">
                      <div className="help-quick-start-card blue">
                        <Home className="help-quick-start-icon" />
                        <h4 className="help-quick-start-title">Home Dashboard</h4>
                        <p className="help-quick-start-text">View your progress and access all features</p>
                      </div>
                      <div className="help-quick-start-card green">
                        <Book className="help-quick-start-icon" />
                        <h4 className="help-quick-start-title">Learning Mode</h4>
                        <p className="help-quick-start-text">Structured lessons with real-time feedback</p>
                      </div>
                      <div className="help-quick-start-card purple">
                        <Camera className="help-quick-start-icon" />
                        <h4 className="help-quick-start-title">Video Translation</h4>
                        <p className="help-quick-start-text">Real-time sign language translation</p>
                      </div>
                      <div className="help-quick-start-card orange">
                        <User className="help-quick-start-icon" />
                        <h4 className="help-quick-start-title">Profile Settings</h4>
                        <p className="help-quick-start-text">Manage your account and preferences</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs Section */}
                  <div className="help-faqs">
                    <h3 className="help-faqs-title">
                      <FileText className="help-faqs-icon" />
                      Frequently Asked Questions
                    </h3>
                    <div className="help-faqs-list">
                      {faqs.map((faq, index) => (
                        <div key={index} className="help-faq-item">
                          <h4 className="help-faq-question">{faq.question}</h4>
                          <p className="help-faq-answer">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Support Section */}
                  <div className="help-support">
                    <h3 className="help-support-title">Still need help?</h3>
                    <div className="help-support-buttons">
                      <button className="help-support-button green">
                        <MessageCircle className="help-support-icon" />
                        <span>Start Live Chat</span>
                      </button>
                      <button className="help-support-button blue">
                        <ExternalLink className="help-support-icon" />
                        <span>Help Center</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="help-search-results">
                  <h3>Search Results</h3>

                  {filteredHelpItems.length > 0 && (
                    <div className="help-search-section">
                      <h4>Help Topics</h4>
                      {filteredHelpItems.map((result, index) => (
                        <div key={index} className="help-search-result">
                          <strong>{result.sectionTitle}</strong>: {result.item}
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredFaqs.length > 0 && (
                    <div className="help-search-section">
                      <h4>FAQs</h4>
                      {filteredFaqs.map((faq, index) => (
                        <div key={index} className="help-faq-item">
                          <h4 className="help-faq-question">{faq.question}</h4>
                          <p className="help-faq-answer">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredHelpItems.length === 0 && filteredFaqs.length === 0 && (
                    <p>No results found. Try a different search term.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <HelpButton />
      {isOpen && <HelpModal />}
    </div>
  );
};

export default HelpMenu;